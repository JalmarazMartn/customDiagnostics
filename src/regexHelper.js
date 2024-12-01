const vscode = require('vscode');
let expressionToCheck = '';
module.exports = {
	openRegexHelpURL: function () {
		openRegexHelpURL();
	},
    pasteEscapedRegex: function(){
        pasteEscapedRegex();
    },
    PickAndCheckRegexInCurrDoc: async function(){
        await PickAndCheckRegexInCurrDoc();
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
async function PickAndCheckRegexInCurrDoc()
{    
    expressionToCheck = await vscode.window.showInputBox({
        prompt: "Type here the regex to find in current document",
        value: expressionToCheck,        
    });
    const document = vscode.window.activeTextEditor.document;
    await checkRegexInDoc(expressionToCheck,document);
    
}
async function checkRegexInDoc(searchExpresion='',document)
{
    const regex = new RegExp(searchExpresion, 'mgi');
    const index = document.getText().search(regex);
    if (index < 0) {
        return;
    }
    let target = document.positionAt(index);
    vscode.window.activeTextEditor.selection = new vscode.Selection(target,new vscode.Position(target.line,target.character+10));
    vscode.window.activeTextEditor.revealRange(new vscode.Selection(target,new vscode.Position(target.line,target.character+10)),vscode.TextEditorRevealType.Default);
    /*vscode.commands.executeCommand(
        'editor.action.goToLocations',
        document.uri,
        target,
        [
            new vscode.Location(
                document.uri,
                target,
            )
        ]);    */
    //procedure (.+)[(]([^)\\r\\n]+)\\r\\n
    /*
            "searchExpresion": "procedure (.+)[(]([^)\n]+)\n",
            "replaceExpression": "procedure $1($2",
    
    */
}
