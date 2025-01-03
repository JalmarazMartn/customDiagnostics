const assert = require('assert');
const noErrorText = 'NoError';
const consoleLogText = 'console.log';
const diagnosticCode = 'TESTTOOL0001';
const messageText = 'Avoid '+consoleLogText;		
const xonsoleLogText = 'xonsole.log';
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
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText,messageText,'');		
		assert.strictEqual(0, diagnostics.length);
	})
	test('get diagnostic', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, consoleLogText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText,messageText,'');
		const diagnostic = diagnostics[0];
		assert.strictEqual(1, diagnostics.length);
		assert.strictEqual(diagnostic.code,diagnosticCode);		
	})
	test('Apply fix to diagnostic', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, consoleLogText, 0, 0);
		assert.strictEqual(doc.lineAt(0).text,consoleLogText);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText,messageText,'');
		const diagnostic = diagnostics[0];
		await testLibrary.applyFixToDiagnostic(doc,diagnostic,consoleLogText,xonsoleLogText);
		assert.strictEqual(doc.lineAt(0).text,xonsoleLogText);
	})
	test('get No diagnostic when regexOptions is case sensitive', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, consoleLogText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText.toUpperCase(),messageText,'gm');
		assert.strictEqual(0, diagnostics.length);
	})
	test('get diagnostic when regexOptions is not case sensitive', async () => {
		let doc = await vscode.workspace.openTextDocument();
		await testLibrary.addTextToDocument(doc, consoleLogText, 0, 0);
		const diagnostics = testLibrary.getDiagnostics(doc,diagnosticCode,consoleLogText.toUpperCase(),messageText,'i');
		const diagnostic = diagnostics[0];
		assert.strictEqual(1, diagnostics.length);
		assert.strictEqual(diagnostic.code,diagnosticCode);		
	})

});
