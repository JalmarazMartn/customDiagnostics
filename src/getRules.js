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
		getDefaultDiagnosticRules: function () {
			return (getDefaultDiagnosticRules());
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
		returnedName = ExtConf.get('JAMDiagnosticsFile');
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
function getDefaultDiagnosticRules()
{
	let defaultDiagnosticRulesetNames = [];
	let rulesFromRuleSetName = [];
	let defaultDiagnosticRules = [];
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		defaultDiagnosticRulesetNames = ExtConf.get('DefaultDiagnosticRuleset');
		for (let indexRuleset = 0; indexRuleset < defaultDiagnosticRulesetNames.length; indexRuleset++) {
			rulesFromRuleSetName = getRulesFromRuleSetName(defaultDiagnosticRulesetNames[indexRuleset]);
			for (let indexRule = 0; indexRule < rulesFromRuleSetName.length; indexRule++) {
				defaultDiagnosticRules.push(rulesFromRuleSetName[indexRule]);
			}
		}
	}
	return (defaultDiagnosticRules);
}