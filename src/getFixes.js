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
    finalFix = fixWithReplaceExpr;
    finalFix.code = currProblems[0].code;
    finalFix.name = await getTextInRange(currProblems[0].range);
    console.log(finalFix);
}
async function getTextInRange(range)
{
    const doc = await vscode.window.activeTextEditor.document;
    let textInRange = doc.lineAt(range.start.line).text.substring(range.start.character,range.end.character);
    return textInRange;
}
async function getCurrCodeActions() {

}