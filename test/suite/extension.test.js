const assert = require('assert');
const noErrorText = 'NoError';
const newText = 'console.log';
const diagnosticCode = 'TESTTOOL0001';
const messageText = 'Avoid '+newText;		

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const testLibrary = require('./testLibrary.js');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
	test('get NO diagnostic', async () => {

		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, noErrorText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,newText,messageText);		
		assert.strictEqual(0, diagnostics.length);
	})
	test('get diagnostic', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, newText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,newText,messageText);
		const diagnostic = diagnostics[0];
		assert.strictEqual(1, diagnostics.length);
		assert.strictEqual(diagnostic.code,diagnosticCode);		
	})
});
