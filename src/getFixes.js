const vscode = require('vscode');
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
module.exports = {
    getFixToClipboard: async function () {
        await getFixToClipboard()
    }
}
async function getFixToClipboard()
{
        const noDiagMessage = 'No diagnostics in the line.';
        const applyFixes = require('./applyFixes.js');
        const currProblems = applyFixes.getProblems(true,true);
        if (!currProblems)
        {
            vscode.window.showInformationMessage(noDiagMessage);
            return;
        }
        if (currProblems.length == 0)
        {
            vscode.window.showInformationMessage(noDiagMessage);
            return;
        }
}

async function getCurrCodeActions()
{

}