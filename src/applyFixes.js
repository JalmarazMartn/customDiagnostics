const vscode = require('vscode');
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
module.exports = {
    pickAndApllyAfixSetName: async function () {
        pickAndApllyAfixSetName(false);
    },
    pickAndApllyAfixSetNameCurrDoc: async function () {
        pickAndApllyAfixSetName(true);
    }
}

function pickAndApllyAfixSetName(onlyCurrDocument = false) {
    const getRuls = require('./getRules.js');
    const fixSets = getRuls.getFixSets();
    let fixSetNames = [];
    if (!fixSets) {
        return;
    }
    for (let i = 0; i < fixSets.length; i++) {
        fixSetNames.push(fixSets[i].name);
    }
    //show vscode code picker with the ruleSetNames        
    vscode.window.showQuickPick(fixSetNames).then(async (value) => {
        if (value) {
            await applyAllFixes(value, onlyCurrDocument);
        }
    }
    );

}
async function applyAllFixes(fixSetName, onlyCurrDocument = false) {
    const getRuls = require('./getRules.js');
    const fixes = getRuls.getFixesFromFixSetName(fixSetName);
    const AppDiagnostics = getProblems(onlyCurrDocument);
    if (!AppDiagnostics) {
        return;
    }
    OutputChannel.clear();
    OutputChannel.show();
    for (let i = 0; i < AppDiagnostics.length; i++) {
        let diagnostic = AppDiagnostics[i];
        let diagFixes = fixes.filter(fix => fix.code === diagnostic.code);
        if (diagFixes) {
            for (let index = 0; index < diagFixes.length; index++) {
                let document = await vscode.workspace.openTextDocument(diagnostic.uri);
                await applyFixToDiagnostic(diagnostic, diagFixes[index], document);
            }
        }
    }
}

async function applyFixToDiagnostic(diagnostic, fix, document) {
    //if (diagnostic.code !== 'AL0223') {
    //    return;
    //}
    const replace = require('./replace.js');
    if (replace.emptySearchexpressionError(fix.searchExpresion, fix.name)) {
        return;
    }
    let edit = new vscode.WorkspaceEdit();
    let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line,
        document.lineAt(diagnostic.range.start.line).text.length);
    //const RegEx = new RegExp(fix.searchExpresion, 'gi');
    //const newLineText = document.lineAt(diagnostic.range.start.line).text.replace(RegEx,fix.replaceExpression);
    const newLineText = replace.getNewText(document.lineAt(diagnostic.range.start.line).text, fix.searchExpresion, fix.replaceExpression,
        fix.jsModuleFilePath, fix.jsFunctionName, document, range);

    if (newLineText === document.lineAt(diagnostic.range.start.line).text) {
        return;
    }
    edit.replace(document.uri, range, newLineText);
    await vscode.workspace.applyEdit(edit);
    OutputChannel.appendLine(fix.name + ' applied in ' + document.uri);
}
function getProblems(onlyCurrDocument = false) {
    let AppUri = vscode.workspace.workspaceFile;
    if (onlyCurrDocument) {
        AppUri = vscode.window.activeTextEditor.document.uri;
    }
    const AppDiagnostics = vscode.languages.getDiagnostics(AppUri);
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
function pushProblem(problemUri = vscode.Uri, Problem, Problems) {
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