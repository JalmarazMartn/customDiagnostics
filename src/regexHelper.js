const vscode = require('vscode');
module.exports = {
	openRegexHelpURL: function () {
		openRegexHelpURL();
	},
    pasteEscapedRegex: function(){
        pasteEscapedRegex();
    }
}
function openRegexHelpURL()
{
    const regexHelpURL = getHelpURL();
    if (regexHelpURL == '')
    {
        vscode.window.showErrorMessage('Configure in settings RegexpHelpURL');
    }
    else
    {
        vscode.env.openExternal(vscode.Uri.parse(regexHelpURL));
    }
}
function getHelpURL()
{
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		const regexHelpURL = ExtConf.get('JAMDiagnostics.RegexpHelpURL');
		if (regexHelpURL) {
			return regexHelpURL;
		}
    }
}
async function pasteEscapedRegex()
{
    const clipboardTxt = await vscode.env.clipboard.readText();
    let escapedClipboardTxt = getEscapedRegex(clipboardTxt);
	var currEditor = vscode.window.activeTextEditor;
	var selection = currEditor.selection;
	const WSEdit = new vscode.WorkspaceEdit;
	let CurrDoc = currEditor.document;
    const prevCharacter = CurrDoc.getText(new vscode.Range(new vscode.Position(selection.start.line,selection.start.character-1),selection.start));
    if (prevCharacter == '"')
    {
        escapedClipboardTxt = getExprWithoutDoubleQuote(escapedClipboardTxt);
    }
	WSEdit.insert(CurrDoc.uri,selection.start,escapedClipboardTxt);
	await vscode.workspace.applyEdit(WSEdit);
}
function getEscapedRegex(origJSONValue='')
{
    let escapedRegex = `const data = JSON.parse(${JSON.stringify(origJSONValue)});`.toString();
    escapedRegex = escapedRegex.replace('const data = JSON.parse(','');
    escapedRegex = escapedRegex.slice(0, -2);
    //finalExpr = finalExpr.replace("\\\\".toString(),"\\".toString());
    return escapedRegex.toString();
}
function getExprWithoutDoubleQuote(doubledQuoted='')
{
    if (doubledQuoted.length < 2)
    {
        return doubledQuoted;
    }
    let ExprWithRemovedDoubleQuote = doubledQuoted;
    if (left(ExprWithRemovedDoubleQuote,1) == '"')
    {
        ExprWithRemovedDoubleQuote = ExprWithRemovedDoubleQuote.substring(1);
    }
    if (right(ExprWithRemovedDoubleQuote,1) == '"')
    {
        ExprWithRemovedDoubleQuote = left(ExprWithRemovedDoubleQuote,ExprWithRemovedDoubleQuote.length-1);
    }
    return ExprWithRemovedDoubleQuote;
}
function right(strToCheck, lenghtToCheck)
{
  return strToCheck.slice(strToCheck.length-lenghtToCheck,strToCheck.length);
}
function left(strToCheck, lenghtToCheck)
{
  return strToCheck.slice(0, lenghtToCheck - strToCheck.length);
}