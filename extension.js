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
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: 'file'},new customerDiagnostics.customDiagnosticsClass));

	const commandsVisibility = require('./src/commandsVisibility.js');
	commandsVisibility.subscribeToDocumentChanges(context);

	let disposableChangeRulesInAllDocs = vscode.commands.registerCommand('JAMCustomRuls.replaceAllRulesInAllDocuments', function () {
		const replace = require('./src/replace.js');
		replace.replaceRulesInAllDocuments();
	});
	context.subscriptions.push(disposableChangeRulesInAllDocs);

	let disposableChangeRulesInCurrentDoc = vscode.commands.registerCommand('JAMCustomRuls.replaceRulesInCurrentDoc', function () {
		const replace = require('./src/replace.js');
		replace.replaceRulesInCurrentDoc();
	});
	context.subscriptions.push(disposableChangeRulesInCurrentDoc);

	let disposableChangeRulesInCurrDocSelection = vscode.commands.registerCommand('JAMCustomRuls.replaceRulesInCurrDocSelection', function () {
		const replace = require('./src/replace.js');
		replace.replaceRulesInCurrDocSelection();
	});
	context.subscriptions.push(disposableChangeRulesInCurrDocSelection);

	let disposablePickAndApllyAfixSetName = vscode.commands.registerCommand('JAMCustomRuls.pickAndApllyAfixSetName', function () {
		const rename = require('./src/applyFixes');
		rename.pickAndApllyAfixSetName();
	});
	context.subscriptions.push(disposablePickAndApllyAfixSetName);

	let disposablepickAndApplyAfixSetNameCurrDoc = vscode.commands.registerCommand('JAMCustomRuls.pickAndApplyAfixSetNameCurrDoc', function () {
		const applyFixes = require('./src/applyFixes');
		applyFixes.pickAndApllyAfixSetNameCurrDoc();
	});
	context.subscriptions.push(disposablepickAndApplyAfixSetNameCurrDoc);

	let disposableOpenRegexHelpURL = vscode.commands.registerCommand('JAMCustomRuls.OpenRegexHelpURL', function () {
		const regexHelper = require('./src/regexHelper.js');
		regexHelper.openRegexHelpURL();
	});
	context.subscriptions.push(disposableOpenRegexHelpURL);

	let disposablePasteEscapedRegex = vscode.commands.registerCommand('JAMCustomRuls.PasteEscapedRegex', function () {
		const regexHelper = require('./src/regexHelper.js');
		regexHelper.pasteEscapedRegex();
	});
	context.subscriptions.push(disposablePasteEscapedRegex);

	let disposableApplyFix = vscode.commands.registerCommand('JAMCustomRuls.ApplyFix', function (diagnostic,fix,document) {
		const applyFixes = require('./src/applyFixes.js');
		applyFixes.applyFixToDiagnostic(diagnostic,fix,document);
	});
	context.subscriptions.push(disposableApplyFix);

	const subsCheckRulesEdition = vscode.languages.createDiagnosticCollection("rulesNotDefined");
	context.subscriptions.push(customDiagnostics);
	const checkRulesEdition = require('./src/checkRulesEdition.js');
	checkRulesEdition.subscribeToDocumentChanges(context, subsCheckRulesEdition);

	const subsCheckDiagnosticsEdition = vscode.languages.createDiagnosticCollection("diagnosticsNotDefined");
	context.subscriptions.push(customDiagnostics);
	const checkDiagnosticsEdition = require('./src/checkDiagnosticEdition.js');
	checkDiagnosticsEdition.subscribeToDocumentChanges(context, subsCheckDiagnosticsEdition);

	const subsCheckFixesEdition = vscode.languages.createDiagnosticCollection("fixesNotDefined");
	context.subscriptions.push(customDiagnostics);
	const checkFixesEdition = require('./src/checkFixEdition.js');
	checkFixesEdition.subscribeToDocumentChanges(context, subsCheckFixesEdition);

	let disposableGetFixToClip = vscode.commands.registerCommand('JAMCustomRuls.getFixToClipboard', function () {
		const getFixes = require('./src/getFixes.js');
		getFixes.getFixToClipboard();
	});
	context.subscriptions.push(disposableGetFixToClip);

	let disposableGetCodeActionFixToClip = vscode.commands.registerCommand('JAMCustomRuls.getCodeActionFixToClipboard', function () {
		const exinstingCodeActions = require('./src/existingCodeActions.js');
		exinstingCodeActions.getFixToClipboard();
	});
	context.subscriptions.push(disposableGetCodeActionFixToClip);

	
	let disposablePickAndCheckRegexInCurrDoc = vscode.commands.registerCommand('JAMCustomRuls.disposablePickAndCheckRegexInCurrDoc', function () {
		const regexHelper = require('./src/regexHelper.js');
		regexHelper.PickAndCheckRegexInCurrDoc();
	});
	context.subscriptions.push(disposablePickAndCheckRegexInCurrDoc);

	context.subscriptions.push(vscode.commands.registerCommand('getContextForTest', () => context));

	

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
		{ language: 'json', scheme: 'file' },

		{
			// eslint-disable-next-line no-unused-vars
			provideCompletionItems(document, position) {
				const checkRulesEdition = require('./src/checkRulesEdition.js');
				return checkRulesEdition.selectRuleInRuleSet();
			}
		},
		'' // trigger
	));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
		{ language: 'json', scheme: 'file' },

		{
			// eslint-disable-next-line no-unused-vars
			provideCompletionItems(document, position) {
				const checkRulesEdition = require('./src/checkFixEdition.js');
				return checkRulesEdition.selectFixInFixSet();
			}
		}
	));

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
		{ language: 'json', scheme: 'file' },

		{
			// eslint-disable-next-line no-unused-vars
			provideCompletionItems(document, position) {
				const checkRulesEdition = require('./src/checkDiagnosticEdition.js');
				return checkRulesEdition.selectDiagnosticInSet();
			}
		}
	));

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
