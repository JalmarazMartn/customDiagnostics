const vscode = require('vscode');
const enableContextVar = 'customdiagnostics.enableFixCommands';
module.exports = {
    subscribeToDocumentChanges: function (context) { subscribeToDocumentChanges(context) }
}

function subscribeToDocumentChanges(context) {
    if (vscode.window.activeTextEditor) {

    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                vscode.commands.executeCommand('setContext', enableContextVar, areDiagnosticsInDocument(editor.document));
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(editor => { 
            if (editor) {
                vscode.commands.executeCommand('setContext', enableContextVar, areDiagnosticsInDocument(editor.document));
            }
        }            
        )
    );
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(document => {
                vscode.commands.executeCommand('setContext', enableContextVar, areDiagnosticsInDocument(document));
            
        })
    );
    function areDiagnosticsInDocument(document) {
        const docDiagnostics = vscode.languages.getDiagnostics(document.uri);
        if (!docDiagnostics) {
            return false;
        }
        return docDiagnostics.length != 0
    }
}