const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	const customDiagnostics = vscode.languages.createDiagnosticCollection("customDiagnostics");
	context.subscriptions.push(customDiagnostics);
	const customerDiagnostics = require('./src/customerDiagnostics.js');
	customerDiagnostics.subscribeToDocumentChanges(context, customDiagnostics);

	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('al',new customerDiagnostics.customDiagnosticsClass));
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
