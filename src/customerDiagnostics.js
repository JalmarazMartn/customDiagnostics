const vscode = require('vscode');
class customDiagnosticsClass {    
    constructor() {
        this.provideCodeActions = function (document, range, context, token,testDocument, diagnostic,fix) {
            const getRules = require('./getRules.js');
            let currFixes = [];
            if (testDocument)
            {
                currFixes.push(this.createCommandCodeAction(diagnostic, fix, document));            
                return currFixes;
            }
            let diagnostics = context.diagnostics;
            if (!diagnostics) {
                return [];
            }

            for (let i = 0; i < diagnostics.length; i++) {
                let diagnostic = diagnostics[i];
                const allFixes = getRules.getFixes();
                allFixes
                    //.filter(fix => fix.code === diagnostic.code.value)
                    .filter(fix => fix.code === getProblemMessageCode(diagnostic.code) || fix.code === "")
                    .map(fix => currFixes.push(this.createCommandCodeAction(diagnostic, fix, document)));
            }
            return currFixes;
        }
    }
    createCommandCodeAction(diagnostic, fix, document) {
        const applyFixes = require('./applyFixes.js');
        if (!document) { document = vscode.window.activeTextEditor.document; }
        const replace = require('./replace.js');
        //const newText = document.lineAt(diagnostic.range.start.line).text.replace(searchRegex,fix.replaceExpression);
        let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line + 1, 0);
        if (!applyFixes.matchSearchExprInFix(document.lineAt(diagnostic.range.start.line).text, fix, diagnostic)) {
            return;
        }
        const newText = replace.getNewText(document.lineAt(diagnostic.range.start.line).text, fix.searchExpresion,
            fix.replaceExpression, fix.jsModuleFilePath, fix.jsFunctionName, document, range,getRegexOptions(diagnostic));
        if (newText === document.lineAt(diagnostic.range.start.line).text) {
            return;
        }
        const CodeAction = new vscode.CodeAction(fix.name, vscode.CodeActionKind.QuickFix);
        CodeAction.diagnostics = [diagnostic];
        CodeAction.isPreferred = true;
        //CodeAction.edit = new vscode.WorkspaceEdit();        
        //CodeAction.edit.replace(document.uri, range, newText);
        CodeAction.command = {
            title: fix.name, command: 'JAMCustomRuls.ApplyFix',
            arguments: [diagnostic,fix,document]
        };
        return CodeAction;
    }
    setTestParameters(doc,diagnostic,fix)
    {

    }
    
};
async function replaceText(document, range = new vscode.Range(0, 0, 0, 0), newText = '') {
    let edit = new vscode.WorkspaceEdit();
    //let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line + 1, 0);
    await edit.replace(document.uri, range, newText);
    await vscode.workspace.applyEdit(edit);
}

module.exports = {
    customDiagnosticsClass: customDiagnosticsClass,
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) },
    isNegativeClause: function (Rexgexp) {
        //replaceAllRulesInAllDocuments()
        return isNegativeClause(Rexgexp)
    },
    GetSeverityFromString: function (severity) {
        return GetSeverityFromString(severity)
    },
    createDiagnostic: function (doc, lineOfText, lineIndex, customRule) {
        return createDiagnostic(doc, lineOfText, lineIndex, customRule);
    },
    replaceText: function (document, range, newText) {
        replaceText(document, range, newText)
    },
    findDiagnosticInDocument: function (customRule,doc,diagnostics)
    {
        findDiagnosticInDocument(customRule,doc,diagnostics);
    }
}

function createDiagnostic(doc, lineOfText, lineIndex, customRule) {
    const index = lineOfText.text.search(customRule.searchExpresion);
    const finalIndex = index + lineOfText.text.match(customRule.searchExpresion)[0].length;
    lineOfText.text.match(customRule.searchExpresion);
    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, finalIndex);
    const diagnostic = new vscode.Diagnostic(range, customRule.message,
        GetSeverityFromString(customRule.severity));
    diagnostic.code = customRule.code;
    diagnostic.source = customRule.language;
    return diagnostic;
}
function subscribeToDocumentChanges(context, customDiagnostic) {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, customDiagnostic);
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(editor.document, customDiagnostic);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, customDiagnostic))
    );
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            if (getEnableWSDiagnostics) { refreshDiagnostics(doc, customDiagnostic) }
            else { customDiagnostic.delete(doc.uri) }
        })
        //vscode.workspace.onDidCloseTextDocument(doc => customDiagnostic.delete(doc.uri))

    );
    context.subscriptions.push(
        vscode.debug.onDidStartDebugSession(e => parseAllDocs(customDiagnostic))
    );

    //context.subscriptions.push(
    //    vscode.workspace.onDidCloseTextDocument (()=>
    //vscode.workspace.textDocuments.forEach(doc => refreshDiagnostics(doc,customDiagnostic))
    //));
    parseAllDocs(customDiagnostic);
}

function refreshDiagnostics(doc, customDiagnostic) {
    let diagnostics = [];
    if (doc.uri.scheme.toString() != 'file') {
        return;
    }
    let customDiagnosticData = getCustomDiagnosticData();
    if (!customDiagnosticData) {
        return;
    }
    for (let i = 0; i < customDiagnosticData.length; i++) {
        findDiagnosticInDocument(customDiagnosticData[i], doc, diagnostics)
    }
    customDiagnostic.set(doc.uri, diagnostics);
}
function findDiagnosticInDocument(customRule, doc, diagnostics) {
    if (customRule.language) {
        if (customRule.language !== doc.languageId) {
            return;
        }
    }
    if (!checkAndFileAlsoInclude(doc, customRule)) {
        return;
    }
    if (checkSkipIfFileInclude(doc, customRule)) {
        return;
    }
    let findMatchByLine = isNegativeClause(customRule.searchExpresion);
    const regex = new RegExp(customRule.searchExpresion, getRegexOptions(customRule));
    if (!findMatchByLine) {
        findMatchByLine = (doc.getText().search(regex) > -1)
    }
    if (findMatchByLine) {
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            if (lineOfText.text.search(regex) !== -1) {
                if (!skipFromSearch(lineOfText.text, customRule.skipFromSearchIfMatch, customRule.code,getRegexOptions(customRule)) &&
                    jsFunctionTrueOrNotExists(customRule.jsModuleFilePath, customRule.jsFunctionName, doc, lineIndex, lineOfText.text)) {
                    diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
                }
            }
        }
    }
}
function checkAndFileAlsoInclude(doc, customRule) {
    if (!customRule.andFileAlsoMustInclude) {
        return true;
    }
    if (customRule.andFileAlsoMustInclude.length == 0) {
        return true;
    }
    const fileAlsoInclude = customRule.andFileAlsoMustInclude;
    for (let index = 0; index < fileAlsoInclude.length; index++) {
        const condition = fileAlsoInclude[index];
        if (condition.searchExpresion) {
            if (doc.getText().search(condition.searchExpresion) < 0) {
                return false
            }
        }
    }
    return true
}
function getCustomDiagnosticData() {
    const getRules = require('./getRules.js');
    let defaultDiagnosticRules = getRules.getDefaultDiagnostics();
    if (!defaultDiagnosticRules) {
        return [];
    }
    for (let i = 0; i < defaultDiagnosticRules.length; i++) {
        try {
            defaultDiagnosticRules[i].searchExpresion = new RegExp(defaultDiagnosticRules[i].searchExpresion, 'i');
        }
        catch (error) {
            showErrorRegExp(defaultDiagnosticRules[i].code, error);
        }
    }
    return defaultDiagnosticRules;
}
function GetSeverityFromString(severity) {
    switch (severity) {
        case 'error':
            return vscode.DiagnosticSeverity.Error;
        case 'warning':
            return vscode.DiagnosticSeverity.Warning;
        case 'information':
            return vscode.DiagnosticSeverity.Information;
        case 'hint':
            return vscode.DiagnosticSeverity.Hint;
        default:
            return vscode.DiagnosticSeverity.Error;
    }
}
function isNegativeClause(RegExp) {
    return (String(RegExp).indexOf('^') > -1)
}
async function parseAllDocs(customDiagnostic) {
    if (!getEnableWSDiagnostics()) {
        return;
    }
    const documents = await vscode.workspace.findFiles('**/*');
    for (let j = 0; j < documents.length; j++) {
        try {
            let document = await vscode.workspace.openTextDocument(documents[j]);
            refreshDiagnostics(document, customDiagnostic);
        }
        catch (error) {
            if (error.message.search(/binary/i) < 0) {
                console.log(error);
            }
        }
    }
}
function getEnableWSDiagnostics() {
    let ScanCustomDiagnosticsInAllWS = false;
    const ExtConf = vscode.workspace.getConfiguration('');
    if (!ExtConf) {
        return ScanCustomDiagnosticsInAllWS
    }
    ScanCustomDiagnosticsInAllWS = ExtConf.get('JAMDiagnostics.ScanCustomDiagnosticsInAllWS');
    if (!ScanCustomDiagnosticsInAllWS) {
        return false;
    }
    return ScanCustomDiagnosticsInAllWS;
}
function skipFromSearch(lineOfText = '', skipFromSearchIfMatch, ruleCode = '',regexOptions='') {
    if (skipFromSearchIfMatch == undefined) { return false }
    if (!skipFromSearchIfMatch) { return false }
    if (skipFromSearchIfMatch == '') { return false }
    try {
        const regex = new RegExp(skipFromSearchIfMatch, regexOptions);
        if (lineOfText.search(regex) !== -1) {
            return true
        }
    }
    catch (error) {
        showErrorRegExp(ruleCode, error);
    }
    return false;
}
function getProblemMessageCode(problemCode) {
    if (!problemCode.value) {
        return problemCode.toString();
    }
    return problemCode.value;
}

function checkSkipIfFileInclude(doc, customRule) {
    if (!customRule.skipIfFileInclude) {
        return false;
    }
    if (customRule.skipIfFileInclude.length == 0) {
        return false;
    }
    const skipIfFileInclude = customRule.skipIfFileInclude;
    for (let index = 0; index < skipIfFileInclude.length; index++) {
        const condition = skipIfFileInclude[index];
        if (condition.searchExpresion) {
            if (doc.getText().search(condition.searchExpresion) > -1) {
                return true
            }
        }
    }
    return false
}
function showErrorRegExp(ruleCode = '', errorRaised) {
    const finalMessage = 'JAMCustomDiagnostics, error parsing rule ' + ruleCode + ' : ' + errorRaised.toString();
    vscode.window.showErrorMessage(finalMessage);
}
function jsFunctionTrueOrNotExists(jsModuleFilePath, jsFunctionName, document, lineNumber, lineOfText) {
    if (!jsModuleFilePath) {
        return true
    }
    if (!jsFunctionName) {
        return true
    }
    if (jsModuleFilePath == '' || jsFunctionName == '') {
        return true;
    }
    try {
        const range = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber + 1, 0));
        var fn = new Function();
        const jsModule = require(jsModuleFilePath);
        fn = jsModule[jsFunctionName];
        var setDocumentAndRange = new Function();
        setDocumentAndRange = jsModule['setDocumentAndRange'];
        if (setDocumentAndRange) {
            setDocumentAndRange(document, range);
        }
        return fn(lineOfText);
    }
    catch (error) {
        vscode.window.showErrorMessage('Error: ' + error.message);
        return false
    }
}
function getRegexOptions(element) {
    const checkRulesEdition = require('./checkRulesEdition.js');
    return checkRulesEdition.getRegexOptions(element);
}