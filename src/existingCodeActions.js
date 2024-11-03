const vscode = require('vscode');
module.exports = {
    getFixToClipboard: async function()
    {
        await getFixToClipboard();
    }
}
async function getCurrCodeActionsSelection(document, codeActions, SelectionRange) {
    for (let currLine = SelectionRange.start.line; currLine <= SelectionRange.end.line; currLine++){
        await pushActionInRangeIfNotExists(currLine,document,codeActions,0,document.lineAt(currLine).firstNonWhitespaceCharacterIndex);
        await pushActionInRangeIfNotExists(currLine,document,codeActions,document.lineAt(currLine).firstNonWhitespaceCharacterIndex,document.lineAt(currLine).text.length);
    }
    
}
async function pushActionInRangeIfNotExists(currline, document, codeActions, firstPos, finalPos) {
    const range = new vscode.Range(new vscode.Position(currline, firstPos), new vscode.Position(currline, finalPos));
    const definition = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", document.uri, range);
    for (let index = 0; index < definition.length; index++) {
        const CodeAction = definition[index];
        pushCodeActionsIfNotExists(CodeAction, codeActions);
    }
}

function pushCodeActionsIfNotExists(codeActionStart, codeActions) {
    const existingCodeActions = codeActions.filter(x => x.title == codeActionStart.title);
    if (existingCodeActions) {
        if (existingCodeActions.length > 0) {
            return;
        }
    }
    codeActions.push(codeActionStart);
}
async function getFixToClipboard() {
    let fixWithCodeAction =
    {
        "name": "",
        "code": "",
        "searchExpresion": "",
        "codeAction": await pickCodeAction()
    }
    vscode.env.clipboard.writeText(JSON.stringify(fixWithCodeAction));

}
async function pickCodeAction() {
    const document = vscode.window.activeTextEditor.document;
    const selectionRange = vscode.window.activeTextEditor.selection;    
    let currCodeActions = [];
    await getCurrCodeActionsSelection(document,currCodeActions,selectionRange);
    if (!currCodeActions) {
        return {}
    }
    if (currCodeActions.length == 0) {
        return {}
    }
    let codeActionsTitles = [];
    for (let index = 0; index < currCodeActions.length; index++) {
        codeActionsTitles.push(currCodeActions[index].title);
    }
    const codeActionTitle = await vscode.window.showQuickPick(codeActionsTitles,
        { placeHolder: 'Choose CodeActions to execute.' });
    if (codeActionTitle == '') {
        return {};
    }
    const codeAction = currCodeActions.filter(x => x.title == codeActionTitle);
    return codeAction[0].title;
}
async function getCommandCodeActionFromTitle(codeActionTitle = '', diagnosticPosition, documentUri) {
    const document = vscode.window.activeTextEditor.document;
    let currCodeActions = [];
    const selectionRange = vscode.window.activeTextEditor.selection;    
    await getCurrCodeActionsSelection(document,currCodeActions,selectionRange);
    if (!currCodeActions) {
        return {}
    }
    if (currCodeActions.length == 0) {
        return {}
    }
    const codeAction = currCodeActions.filter(x => x.title == codeActionTitle);
    return codeAction[0];
}
async function execCodeAction(codeActions) {
    if (codeActions[0].command) {
        let executionsWithArgs = 'vscode.commands.executeCommand(codeActions[0].command.command';
        if (codeActions[0].command.arguments) {
            for (let index = 0; index < codeActions[0].command.arguments.length; index++) {
                executionsWithArgs = executionsWithArgs + ',codeActions[0].command.arguments[' + index.toString() + ']';
            }
            executionsWithArgs = executionsWithArgs + ');';
        }
        await eval(executionsWithArgs);
        return;
    }
    if (codeActions[0].edit) {
        await applyEditFromCodeActions(codeActions);
    }
}
async function applyEditFromCodeActions(codeActions) {    
    /*for (let index = 0; index < codeActions.length; index++) {
        const element = codeActions[index];
            console.log(element.edit.c[0].edit);
            console.log(element.edit.c[1].edit);
            console.log(element.edit.c[0].edit.newText);
            console.log(element.edit.c[1].edit.newText);
    }*/
    await vscode.workspace.applyEdit(codeActions[0].edit);
}

async function applyCodeAction(diagnostic, fix, document) {    
    const codeAction = await getCommandCodeActionFromTitle(fix.codeAction, diagnostic.start, document.uri);
    if (!codeAction) {
        return false;
    }
    await execCodeAction(codeAction);
    return true;
}
