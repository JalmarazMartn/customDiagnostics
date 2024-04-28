const assert = require('assert');
const noErrorText = 'NoError';
const consoleLogText = 'console.log';
const diagnosticCode = 'TESTTOOL0001';
const messageText = 'Avoid '+consoleLogText;		

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
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText,messageText);		
		assert.strictEqual(0, diagnostics.length);
	})
	test('get diagnostic', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, consoleLogText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText,messageText);
		const diagnostic = diagnostics[0];
		assert.strictEqual(1, diagnostics.length);
		assert.strictEqual(diagnostic.code,diagnosticCode);		
	})
	test('Set fix to diagnostic', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, consoleLogText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText,messageText);
		const diagnostic = diagnostics[0];		
		
		assert.strictEqual(1, diagnostics.length);
		assert.strictEqual(diagnostic.code,diagnosticCode);		

	})
});
