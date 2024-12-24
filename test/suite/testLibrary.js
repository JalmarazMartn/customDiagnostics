const vscode = require('vscode');
module.exports = {
    addTextToDocument: async function(doc, newText, line, column)
    {
        await addTextToDocument(doc, newText, line, column);
    },
    getDiagnostics: function(doc,diagnosticCode,searchExpresion,messageText,regexOptions)
    {
        return getDiagnostics(doc,diagnosticCode,searchExpresion,messageText,regexOptions);
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
function getDiagnostics(doc,diagnosticCode='',searchExpresion='',messageText='',regexOptions='')
{
	const customerDiagnostics = require('../../src/customerDiagnostics.js');
	const customRule = 
		{
			"code": diagnosticCode,
            "message": messageText,
            "searchExpresion": searchExpresion,
            "severity": "error",
            "regexOptions": regexOptions,            
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
}
async function getContextForTest()
{
    return await vscode.commands.executeCommand("getContextForTest");
}