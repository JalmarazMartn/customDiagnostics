const vscode = require('vscode');
//setup file
//regular expresion 
//language

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	const customDiagnostics = vscode.languages.createDiagnosticCollection("customDiagnostics");
	context.subscriptions.push(customDiagnostics);
	const customerDiagnostics = require('./src/customerDiagnostics.js');
	customerDiagnostics.subscribeToDocumentChanges(context, customDiagnostics);

	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('al',new customerDiagnostics.customDiagnosticsClass));

	let disposableChangeRulesInAllDocs = vscode.commands.registerCommand('JAMCustomRuls.replaceAllRulesInAllDocuments', function () {
		const rename = require('./src/replace.js');
		rename.replaceRulesInAllDocuments();
	});
	context.subscriptions.push(disposableChangeRulesInAllDocs);

	let disposablePickAndApllyAfixSetName = vscode.commands.registerCommand('JAMCustomRuls.pickAndApllyAfixSetName', function () {
		const rename = require('./src/applyFixes');
		rename.pickAndApllyAfixSetName();
	});
	context.subscriptions.push(disposablePickAndApllyAfixSetName);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
