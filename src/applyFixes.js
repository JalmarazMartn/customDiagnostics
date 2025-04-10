const vscode = require('vscode');
let lastPickedItem = '';
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
module.exports = {
    pickAndApllyAfixSetName: async function () {
        pickAndApllyAfixSetName(false);
    },
    pickAndApllyAfixSetNameCurrDoc: async function () {
        pickAndApllyAfixSetName(true);
    },
    matchSearchExprInFix: function (originalText, fix, diagnostic) {
        return (matchSearchExprInFix(originalText, fix, diagnostic));
    },
    applyFixToDiagnostic: async function (diagnostic, fix, document) {
        await applyFixToDiagnostic(diagnostic, fix, document)
    },
    getProblems: function (onlyCurrDocument = false, currSelectionOnly = false) {
        return getProblems(onlyCurrDocument, currSelectionOnly);
    }
}

function pickAndApllyAfixSetName(onlyCurrDocument = false) {
    const getRuls = require('./getRules.js');
    const fixSets = getRuls.getFixSets();
    let scope = 'workspace';
    if (onlyCurrDocument) {
        scope = 'document';
    }
    let fixSetNames = [];
    if (!fixSets) {
        return;
    }
    for (let i = 0; i < fixSets.length; i++) {
        if (GetApplyScope(fixSets[i], scope)) {
            fixSetNames.push(fixSets[i].name);
        }
    }
    //show vscode code picker with the ruleSetNames
    placeLastSelectionInTop(fixSetNames, lastPickedItem);        
    vscode.window.showQuickPick(fixSetNames).then(async (value) => {
        if (value) {
            lastPickedItem = value;
            await applyAllFixes(value, onlyCurrDocument);
        }
    }
    );

}
async function applyAllFixes(fixSetName, onlyCurrDocument = false) {
    const getRuls = require('./getRules.js');
    const fixes = getRuls.getFixesFromFixSetName(fixSetName);
    const AppDiagnostics = getProblems(onlyCurrDocument, false);
    if (!AppDiagnostics) {
        return;
    }
    OutputChannel.clear();
    OutputChannel.show();
    for (let i = 0; i < AppDiagnostics.length; i++) {
        let diagnostic = AppDiagnostics[i];
        let diagFixes = fixes.filter(fix => (fix.code === diagnostic.code || fix.code === ""));
        if (diagFixes) {
            for (let index = 0; index < diagFixes.length; index++) {
                let document = await vscode.workspace.openTextDocument(diagnostic.uri);
                if (await applyFixWithReturn(diagnostic, diagFixes[index], document)) {
                    break;
                }
            }
        }
    }
    OutputChannel.appendLine('Process ended');
}

async function applyFixToDiagnostic(diagnostic, fix, document) {
    const endResult = await applyFixWithReturn(diagnostic, fix, document);
}
async function applyFixWithReturn(diagnostic, fix, document) {
    //if (diagnostic.code !== 'AL0223') {
    //    return;
    //}
    const replace = require('./replace.js');
    if (replace.emptySearchexpressionError(fix.searchExpresion, fix.name)) {
        return false;
    }
    let edit = new vscode.WorkspaceEdit();
    let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line,
        document.lineAt(diagnostic.range.start.line).text.length);
    //const RegEx = new RegExp(fix.searchExpresion, 'gi');
    //const newLineText = document.lineAt(diagnostic.range.start.line).text.replace(RegEx,fix.replaceExpression);
    if (!matchSearchExprInFix(document.lineAt(diagnostic.range.start.line).text, fix, diagnostic)) {
        return false;
    }
    let newLineText = '';
    if (fix.replaceExpression != '') {
        newLineText = getNewLineText(fix, diagnostic, document.lineAt(diagnostic.range.start.line).text);
    }
    else {
        if (fix.jsFunctionName != '') {
            newLineText = replace.getNewText(document.lineAt(diagnostic.range.start.line).text, fix.searchExpresion, fix.replaceExpression,
                fix.jsModuleFilePath, fix.jsFunctionName, document, range,getRegexOptions(fix));
        }
        else {
            if (fix.codeAction != '') {
                const getFixes = require('./getFixes.js');
                if (getFixes.applyCodeAction(diagnostic, fix,document)) { return true }
            }
        }
    }
    if (newLineText === document.lineAt(diagnostic.range.start.line).text) {
        return false;
    }
    edit.replace(document.uri, range, newLineText);
    await vscode.workspace.applyEdit(edit);
    await OutputChannel.appendLine(fix.name + ' applied in ' + document.uri);
    return true;
}
function getProblems(onlyCurrDocument = false, currSelectionOnly = false) {
    let AppUri = vscode.workspace.workspaceFile;
    let AppDiagnostics = [];
    if (onlyCurrDocument) {
        AppUri = vscode.window.activeTextEditor.document.uri;
    }
    const docDiagnostics = vscode.languages.getDiagnostics(AppUri);
    if (currSelectionOnly) {
        const selectionDiagnostics = docDiagnostics.filter(x => x.range.start.line == vscode.window.activeTextEditor.selection.start.line);
        if (!selectionDiagnostics) {
            return AppDiagnostics;
        }
        AppDiagnostics = selectionDiagnostics;
    }
    else {
        AppDiagnostics = docDiagnostics;
    }
    let Problems = [];
    if (!AppDiagnostics) {
        return [];
    }
    for (let i = 0; i < AppDiagnostics.length; i++) {
        if (onlyCurrDocument) {
            pushProblem(AppUri, AppDiagnostics[i], Problems)
        }
        else {
            for (let j = 0; j < AppDiagnostics[i][1].length; j++) {
                let Problem = AppDiagnostics[i][1][j];
                pushProblem(AppDiagnostics[i][0].path, Problem, Problems)
            }
        }
    }
    return Problems;
}

function pushProblem(problemUri, Problem, Problems) {
    let ProblemRange = Problem.range;
    Problems.push(
        {
            uri: problemUri,
            range: ProblemRange,
            code: getProblemMessageCode(Problem.code),
            message: Problem.message,
            severity: Problem.severity
        })
}
function getProblemMessageCode(problemCode) {
    if (!problemCode.value) {
        return problemCode.toString();
    }
    return problemCode.value;
}
function GetApplyScope(ruleSet = {}, scope = '') {
    if (!ruleSet.scope) {
        return true;
    }
    if (ruleSet.scope.length == 0) {
        return true;
    }
    for (let index = 0; index < ruleSet.scope.length; index++) {
        if (ruleSet.scope[index] == scope) {
            return true;
        }
    }
    return false;
}

function matchSearchExprInFix(originalText = '', fix, diagnostic) {
    try {
        const regex = new RegExp(fix.searchExpresion,getRegexOptions(fix));
        if (originalText.search(regex) < 0) {
            return false;
        }
        if (fix.code == "") {
            if (diagnostic.message.search(regex) < 0) {
                return false;
            }
        }
    }
    catch (error) {
        showErrorRegExp(fix.name, error);
    }

    return true;
}
function showErrorRegExp(ruleName = '', errorRaised) {
    const finalMessage = 'JAMCustomDiagnostics, error parsing rule ' + ruleName + ' : ' + errorRaised.toString();
    vscode.window.showErrorMessage(finalMessage);
}
function getNewLineText(fix, diagnostic, originalText) {
    let newLineText = originalText;
    const regex = new RegExp(fix.searchExpresion, 'i');
    let diagnosticStart = diagnostic.range.start.character + 1;
    let matchSearch = originalText.substring(diagnosticStart).match(regex);
    if (!matchSearch) {
        diagnosticStart = 0;
        matchSearch = originalText.substring(diagnosticStart).match(regex);
        if (!matchSearch) {
            return newLineText;
        }
    }
    const matchText = matchSearch[0];
    const newLineTextPartial = matchText.replace(regex, fix.replaceExpression);
    diagnosticStart = diagnosticStart + matchSearch.index;
    const diagnosticEnd = diagnosticStart + matchText.length;
    newLineText = originalText.substring(0, diagnosticStart) + newLineTextPartial +
        originalText.substring(diagnosticEnd)
    return newLineText;
}
function placeLastSelectionInTop(ruleSetNames, lastPickedItem) {
    //bring it from replace.js to avoid duplicity
    const replace = require('./replace.js');
    replace.placeLastSelectionInTop(ruleSetNames, lastPickedItem);
}
function getRegexOptions(element) {
    const checkRulesEdition = require('./checkRulesEdition.js');
    return checkRulesEdition.getRegexOptions(element);
}