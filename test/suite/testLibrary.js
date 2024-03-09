const vscode = require('vscode');
module.exports = {
    addTextToDocument: async function(doc, newText, line, column)
    {
        await addTextToDocument(doc, newText, line, column);
    },
    getDiagnostics: function(doc,diagnosticCode,searchExpresion,messageText)
    {
        return getDiagnostics(doc,diagnosticCode,searchExpresion,messageText);
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