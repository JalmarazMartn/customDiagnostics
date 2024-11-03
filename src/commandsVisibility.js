const vscode = require('vscode');
const enableContextVar = 'customdiagnostics.enableFixCommands';
module.exports = {
 subscribeToDocumentChanges :function (context) 
{ subscribeToDocumentChanges(context); }
}

function subscribeToDocumentChanges(context) {
    /*if (vscode.window.activeTextEditor) {

    }*/
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
    //https://github.com/TooTallNate/keypress
    //https://stackoverflow.com/questions/11804077/node-js-mouse-press-event-in-the-shell
    /*
    var keypress = require('keypress');

    

    // make `process.stdin` begin emitting "keypress" events
    keypress(process.stdin);
    
    // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
      console.log('got "keypress"', key);
      if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
      }
    });
    //https://blog.sandworm.dev/state-of-npm-2023-most-popular-best-quality-packages
    //process.stdin.setRawMode(true);
    //process.stdin.resume();
    */
}
function areDiagnosticsInDocument(document) {
    const docDiagnostics = vscode.languages.getDiagnostics(document.uri);
    if (!docDiagnostics) {
        return false;
    }
    return docDiagnostics.length != 0
}
