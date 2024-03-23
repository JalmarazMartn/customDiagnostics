//DocumentRangeFormattingEditProvider
//vscode.executeFormatRangeProvider
const vscode = require('vscode');
const fixWithCodeAction =
{
    "name": "",
    "code": "",
    "searchExpresion": "",
    "codeAction": ""
}
const fixWithReplaceExpr =
{
    "name": "",
    "code": "",
    "searchExpresion": "",
    "replaceExpression": ""
}

module.exports = {
    getFixToClipboard: async function () {
        await getFixToClipboard()
    }
}
async function getFixToClipboard() {
    const noDiagMessage = 'No diagnostics in the line.';
    const applyFixes = require('./applyFixes.js');
    const currProblems = applyFixes.getProblems(true, true);
    let finalFix = {}
    if (!currProblems) {
        vscode.window.showInformationMessage(noDiagMessage);
        return;
    }
    if (currProblems.length == 0) {
        vscode.window.showInformationMessage(noDiagMessage);
        return;
    }
    const codeAction = await pickCodeAction();
    if (codeAction.length == 0)
    {
        //finalFix = fixWithReplaceExpr;
    }
    else
    {
        finalFix = fixWithCodeAction;
        finalFix.codeAction = codeAction.command.title;
    }
    finalFix.code = currProblems[0].code;
    finalFix.name = await getTextInRange(currProblems[0].range);    
    vscode.env.clipboard.writeText(JSON.stringify(finalFix));
}
async function getTextInRange(range) {
    const doc = await vscode.window.activeTextEditor.document;
    let textInRange = doc.lineAt(range.start.line).text.substring(range.start.character, range.end.character);
    return textInRange;
}
async function getCurrCodeActions() {
    let codeActions = [];
    const startRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
        vscode.window.activeTextEditor.selection.start);

    const codeActionsStart = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", vscode.window.activeTextEditor.document.uri,
        startRange);
    if (!codeActionsStart) {
        return codeActions;
    }
    for (let index = 0; index < codeActionsStart.length; index++) {
        pushCodeActionsIfNotExists(codeActionsStart[index], codeActions);
        //codeActions.push(codeActionsStart[index]);
    }

    return codeActions;
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
async function pickCodeAction() {
    const currCodeActions = await getCurrCodeActions();
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
    return codeAction[0];
}