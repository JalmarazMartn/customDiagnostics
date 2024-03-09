const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
	test('get diagnostic', async () => {
		const newText = 'console.log';
		const diagnosticCode = 'TESTTOOL0001';
		const messageText = 'Avoid '+newText;		

		let doc = await vscode.workspace.openTextDocument();
		let diagnostics = getDiagnostics(doc,diagnosticCode,newText,messageText);
		await addTextToDocument(doc, newText, 0, 0);
		assert.strictEqual(0, (diagnostics).length);
		diagnostics = getDiagnostics(doc,diagnosticCode,newText,messageText);
		const diagnostic = diagnostics[0];
		assert.strictEqual(1, (diagnostics).length);
		assert.strictEqual(diagnostic.code,diagnosticCode);
	})
});
//general
async function addTextToDocument(doc, newText, line = 0, column = 0) {
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