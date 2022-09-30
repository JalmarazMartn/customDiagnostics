const vscode = require('vscode');
module.exports = {
    isNegativeClause: function (Rexgexp) {
        //replaceAllRulesInAllDocuments()
        return isNegativeClause(Rexgexp)
    }
}

class customDiagnosticsClass {
    constructor() {
        this.provideCodeActions = function (document, range, context, token) {
            const getRules = require('./getRules.js');
            let currFixes = [];
            let diagnostics = context.diagnostics;
            if (!diagnostics) {
                return [];
            }
            for (let i = 0; i < diagnostics.length; i++) {
                let diagnostic = diagnostics[i];
                const allFixes = getRules.getFixes();
                allFixes
                .filter(fix => fix.code === diagnostic.code.value)
                .map(fix => currFixes.push(this.createCommandCodeAction(diagnostic,fix)));
            }
            return currFixes;
		}
    }
    createCommandCodeAction(diagnostic,fix,document) {
        if (!document)
        { document = vscode.window.activeTextEditor.document; }
        const searchRegex = new RegExp(fix.searchExpresion,'gi');        
        const newText = document.lineAt(diagnostic.range.start.line).text.replace(searchRegex,fix.replaceExpression);
        if (newText === document.lineAt(diagnostic.range.start.line).text) {
            return;
        }
        const action = new vscode.CodeAction(fix.name, vscode.CodeActionKind.QuickFix);        
        //action.command = { command: COMMAND, title: 'Learn more about transferfields', tooltip: 'This will open the transferfields page.' };
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        action.edit = new vscode.WorkspaceEdit();        
        let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line+1, 0);        
		action.edit.replace(document.uri, range, newText);        
        return action;
    }
};
module.exports = {
    customDiagnosticsClass: customDiagnosticsClass,
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) }
}

function createDiagnostic(doc, lineOfText, lineIndex, customRule) {
    const index = lineOfText.text.search(customRule.searchExpresion);
    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, index);
    const diagnostic = new vscode.Diagnostic(range, customRule.message,
        GetSeverityFromString(customRule.severity));
    diagnostic.code = customRule.code;
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
        vscode.workspace.onDidCloseTextDocument(doc => customDiagnostic.delete(doc.uri))
    );
}

function refreshDiagnostics(doc, customDiagnostic) {
    let diagnostics = [];
    let customDiagnosticData = getCustomDiagnosticData();
    if (!customDiagnosticData) {
        return;
    }    
    for (let i = 0; i < customDiagnosticData.length; i++) {
        let customRule = customDiagnosticData[i];
        let findMatchByLine = isNegativeClause(customRule.searchExpresion);
        if (!findMatchByLine)
        {
            findMatchByLine = (doc.getText().search(customRule.searchExpresion) > -1)
        }
        if (findMatchByLine) {
            for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
                const lineOfText = doc.lineAt(lineIndex);
                if (lineOfText.text.search(customRule.searchExpresion) !== -1) {
                    diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
                }
            }
        }
    }
    customDiagnostic.set(doc.uri, diagnostics);
}
function getCustomDiagnosticData() {
    const getRules = require('./getRules.js');
    let defaultDiagnosticRules = getRules.getDefaultDiagnostics();
    if (!defaultDiagnosticRules) {
        return[];
    }    
    for (let i = 0; i < defaultDiagnosticRules.length; i++) {        
        defaultDiagnosticRules[i].searchExpresion = new RegExp(defaultDiagnosticRules[i].searchExpresion, 'i');
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
function isNegativeClause(RegExp)
{
    return (String(RegExp).indexOf('^') > -1)
}