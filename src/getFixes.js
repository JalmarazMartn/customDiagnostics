//DocumentRangeFormattingEditProvider
//vscode.executeFormatRangeProvider
const vscode = require('vscode');

module.exports = {
    getFixToClipboard: async function () {
        await getFixToClipboard()
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
    /*}
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
    } */
}
async function getTextInRange(range) {
    const doc = await vscode.window.activeTextEditor.document;
    let textInRange = doc.lineAt(range.start.line).text.substring(range.start.character, range.end.character);
    return removeDoubleQuote(textInRange);
}

function removeDoubleQuote(originalText = '') {
    if (originalText == '') {
        return originalText;
    }
    return originalText.replace(RegExp('"', 'g'), '');
}
/*function addLineBreaks(originalText='')
{
    return originalText.replace(RegExp('","', 'g'),'",\n"');
}*/