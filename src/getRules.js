module.exports = {
	  getSetupJSON: function () {
		  return (GetAllSetupJSON());
		},
		getRules: function () {
			return (getRules());
		},
		getRuleSets: function () {
			return (getRuleSets());
		},
		getRulesFromRuleSetName: function (ruleSetName) {
			return (getRulesFromRuleSetName(ruleSetName));
		},
		getDefaultDiagnostics: function () {
			return (getDefaultDiagnostics());
		},
		getFixSets: function () {
			return (getFixSets());
		},
		getFixesFromFixSetName: function (fixSetName) {
			return (getFixesFromFixSetName(fixSetName));
		},
		getDiagnosticsFromDiagnosticSetName: function (diagnosticSetName) {
			return (getDiagnosticsFromDiagnosticSetName(diagnosticSetName));
		}
}
const vscode = require('vscode');
function GetAllSetupJSON()
{
	var JSONSetup = [];
	const fs = require('fs');
	const JSONFileURI = GetFullPathFileJSONS();
	if (fs.existsSync(JSONFileURI.fsPath)) {
		var oldJSON = fs.readFileSync(JSONFileURI.fsPath, "utf-8");
		JSONSetup = JSON.parse(oldJSON);
	}
	return (JSONSetup);
}
function GetFullPathFileJSONS() {
	var returnedName = '';
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		returnedName = ExtConf.get('JAMDiagnostics.FilePath');
	}
	return (vscode.Uri.file(returnedName));
}
function getRules()
{
	var rules = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		rules = setupJSON.rules;
	}
	return (rules);
}
function getRuleSets()
{
	var ruleSets = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		ruleSets = setupJSON.rulesets;
	}
	return (ruleSets);
}
function getRulesFromRuleSetName(ruleSetName)
{
	var rules = [];
	var allRules = getRules();
	var ruleSets = getRuleSets();
	let ruleSet = ruleSets.find(x => x.name === ruleSetName);
	for (let i = 0; i < ruleSet.rules.length; i++) {
		let rule = allRules.find(x => x.code === ruleSet.rules[i]);
		if (rule) {
			rules.push(rule);
		}
	}
	return (rules);
}
function getDefaultDiagnostics()
{
	let defaultDiagnosticRulesetNames = [];
	let rulesFromRuleSetName = [];
	let defaultDiagnosticRules = [];
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		defaultDiagnosticRulesetNames = ExtConf.get('JAMDiagnostics.DefaultDiagnosticRuleset');
		for (let indexRuleset = 0; indexRuleset < defaultDiagnosticRulesetNames.length; indexRuleset++) {
			rulesFromRuleSetName = getDiagnosticsFromDiagnosticSetName(defaultDiagnosticRulesetNames[indexRuleset]);
			for (let indexRule = 0; indexRule < rulesFromRuleSetName.length; indexRule++) {
				defaultDiagnosticRules.push(rulesFromRuleSetName[indexRule]);
			}
		}
	}
	return (defaultDiagnosticRules);
}
function getFixSets()
{
	var ruleSets = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		ruleSets = setupJSON.fixsets;
	}
	return (ruleSets);
}
function getDiagnosticsFromDiagnosticSetName(diagnosticSetName)
{
	var diagnostics = [];
	var allDiagnostics = getDiagnostics();
	var diagnosticSets = getDiagnosticSets();
	let diagnosticSet = diagnosticSets.find(x => x.name === diagnosticSetName);
	for (let i = 0; i < diagnosticSet.diagnostics.length; i++) {
		let diagnostic = allDiagnostics.find(x => x.code === diagnosticSet.diagnostics[i]);
		if (diagnostic) {
			diagnostics.push(diagnostic);
		}
	}
	return (diagnostics);
}
function getDiagnostics()
{
	var diagnostics = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		diagnostics = setupJSON.diagnostics;
	}
	return (diagnostics);
}
function getDiagnosticSets()
{
	var diagnosticSets = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		diagnosticSets = setupJSON.dianosticsets;
	}
	return (diagnosticSets);
}
function getFixesFromFixSetName(fixSetName)
{
	var fixes = [];
	var allFixes = getFixes();
	var fixSets = getFixSets();
	let fixSet = fixSets.find(x => x.name === fixSetName);
	for (let i = 0; i < fixSet.rules.length; i++) {
		let fix = allFixes.find(x => x.code === fixSet.rules[i]);
		if (fix) {
			fixes.push(fix);
		}
	}
	return (fixes);
}
function getFixes()
{
	var fixes = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		fixes = setupJSON.fixes;
	}
	return (fixes);
}