const vscode = require('vscode');
module.exports = {
    addTextToDocument: async function(doc, newText, line, column)
    {
        await addTextToDocument(doc, newText, line, column);
    },
    getDiagnostics: function(doc,diagnosticCode,searchExpresion,messageText)
    {
        return getDiagnostics(doc,diagnosticCode,searchExpresion,messageText);
    },
    applyFixToDiagnostic: async function(doc,diagnostic,searchExpresion,replaceExpression)
    {
        await applyFixToDiagnostic(doc,diagnostic,searchExpresion,replaceExpression)
    }
}
//general
async function addTextToDocument(doc, newText='', line = 0, column = 0) {
	let edit = new vscode.WorkspaceEdit();
	edit.insert(doc.uri, new vscode.Position(line, column), newText);
	await vscode.workspace.applyEdit(edit);
}
//especific
function getDiagnostics(doc,diagnosticCode='',searchExpresion='',messageText='')
{
	const customerDiagnostics = require('../../src/customerDiagnostics.js');
	const customRule = 
		{
			"code": diagnosticCode,
            "message": messageText,
            "searchExpresion": searchExpresion,
            "severity": "error",
            "language": doc.languageId,
		};
	let diagnostics = [];
	customerDiagnostics.findDiagnosticInDocument(customRule,doc,diagnostics);
	return diagnostics;
}
async function applyFixToDiagnostic(doc,diagnostic,searchExpresion,replaceExpression)
{
const fix = {"name":searchExpresion,
"searchExpresion":searchExpresion,
"replaceExpression":replaceExpression}

//            fix., fix.jsModuleFilePath, fix.jsFunctionName
const applyFixes = require('../../src/applyFixes.js');
await applyFixes.applyFixToDiagnostic(diagnostic,fix,doc);
const lineText = doc.lineAt(0).text;
console.log(lineText);
}
async function getContextForTest()
{
    return await vscode.commands.executeCommand("getContextForTest");
}