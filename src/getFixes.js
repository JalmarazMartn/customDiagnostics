//DocumentRangeFormattingEditProvider
//vscode.executeFormatRangeProvider
const vscode = require('vscode');

module.exports = {
    getFixToClipboard: async function () {
        await getFixToClipboard()
    },
    getCommandCodeActionFromTitle: async function(codeActionTitle,diagnosticPosition,documentUri)
    {
        return await getCommandCodeActionFromTitle(codeActionTitle,diagnosticPosition,documentUri);
    }
}
async function getFixToClipboard() {
    const noDiagMessage = 'No diagnostics in the line.';
    const applyFixes = require('./applyFixes.js');
    const currProblems = applyFixes.getProblems(true, true);
    if (!currProblems) {
        vscode.window.showInformationMessage(noDiagMessage);
        return;
    }
    if (currProblems.length == 0) {
        vscode.window.showInformationMessage(noDiagMessage);
        return;
    }
    const codeAction = await pickCodeAction();    
    let codeActionTitle = '';
    if (codeAction)
    {
        if (codeAction.length != 0)
        {
            codeActionTitle = codeAction.title;
        }
    }
    if (codeActionTitle == '')
    {
        let fixWithReplaceExpr =
        {
            "name": "",
            "code": "",
            "searchExpresion": "",
            "replaceExpression": ""
        }

        fixWithReplaceExpr.code = currProblems[0].code;
        fixWithReplaceExpr.name = await getTextInRange(currProblems[0].range);        
        fixWithReplaceExpr.searchExpresion = fixWithReplaceExpr.name;
        vscode.env.clipboard.writeText(JSON.stringify(fixWithReplaceExpr));
    }
    else
    {
        let fixWithCodeAction =
        {
            "name": "",
            "code": "",
            "searchExpresion": "",
            "codeAction": ""
        }        
        fixWithCodeAction.code = currProblems[0].code;
        fixWithCodeAction.name = await getTextInRange(currProblems[0].range);        
        fixWithCodeAction.codeAction = codeActionTitle;
        fixWithCodeAction.searchExpresion = fixWithCodeAction.name;
        vscode.env.clipboard.writeText(JSON.stringify(fixWithCodeAction));
    }    
}
async function getTextInRange(range) {
    const doc = await vscode.window.activeTextEditor.document;
    let textInRange = doc.lineAt(range.start.line).text.substring(range.start.character, range.end.character);
    return textInRange;
}
async function getCurrCodeActions(startPosition,documentUri) {
    let codeActions = [];
    const startRange = new vscode.Range(startPosition,startPosition);

    const codeActionsStart = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", documentUri,startRange);
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
    const currCodeActions = await getCurrCodeActions(vscode.window.activeTextEditor.selection.start,vscode.window.activeTextEditor.document.uri);
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
async function getCommandCodeActionFromTitle(codeActionTitle='',diagnosticPosition,documentUri)
{
    const currCodeActions = await getCurrCodeActions(diagnosticPosition,documentUri);
    if (!currCodeActions) {
        return {}
    }
    if (currCodeActions.length == 0) {
        return {}
    }
    const codeAction = currCodeActions.filter(x => x.title == codeActionTitle);
    return codeAction[0].command;
      
}