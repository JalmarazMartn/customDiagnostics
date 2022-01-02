const vscode = require('vscode');
class customDiagnosticsClass
{
	constructor()
	{
		this.provideCodeActions = function (document,range,context,token) {
            let customDiagnosticData = getCustomDiagnosticData();
			return context.diagnostics
			.filter(diagnostic => diagnostic.code === customDiagnosticData.code)
			.map(diagnostic => this.createCommandCodeAction(diagnostic));
		}
	}
	createCommandCodeAction(diagnostic) {
		const action = new vscode.CodeAction('Break down fields', vscode.CodeActionKind.QuickFix);
		//action.command = { command: COMMAND, title: 'Learn more about transferfields', tooltip: 'This will open the transferfields page.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
};
module.exports = {
    customDiagnosticsClass: customDiagnosticsClass,
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) }
}

function createDiagnostic(doc, lineOfText, lineIndex) {
    // find where in the line of thet the 'emoji' is mentioned
    let customDiagnosticData = getCustomDiagnosticData();
    const index = lineOfText.text.search(customDiagnosticData.searchExpresion);
    // create range that represents, where in the document the word is
    const range = new vscode.Range(lineIndex, index, lineIndex, index);
    const diagnostic = new vscode.Diagnostic(range, customDiagnosticData.message, 
        GetSeverityFromString(customDiagnosticData.severity));
    diagnostic.code = customDiagnosticData.code;
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
    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
        const lineOfText = doc.lineAt(lineIndex);
        if (lineOfText.text.search(customDiagnosticData.searchExpresion) !== -1) {
            diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex));
        }
    }
    customDiagnostic.set(doc.uri, diagnostics);
}
function getCustomDiagnosticData() {
    const fs = require('fs');
    const path = require('path');
    let CustomDiagnosticData = JSON.parse(fs.readFileSync(path.join(__dirname, 'customDiagnostic.json'), 'utf8'));
    CustomDiagnosticData.searchExpresion = new RegExp(CustomDiagnosticData.searchExpresion,'i');    
    return CustomDiagnosticData;
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