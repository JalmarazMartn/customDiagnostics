module.exports = {
	  /*getSetupJSON: function () {
		  return (GetAllSetupJSON());
		},*/
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
		getFixes: function () {
			return (getFixes());
		},
		getDiagnosticsFromDiagnosticSetName: function (diagnosticSetName) {
			return (getDiagnosticsFromDiagnosticSetName(diagnosticSetName));
		},
		getFileExtensionFormRuleSetName: function (ruleSetName) {
			return (getFileExtensionFormRuleSetName(ruleSetName));
		}		
}
const vscode = require('vscode');
function GetAllSetupJSON()
{
	var JSONSetup = [];
	const fs = require('fs');
	const JSONFileURIs = GetFullPathFileJSONS();
	for (let i = 0; i < JSONFileURIs.length; i++) {
		if (fs.existsSync(JSONFileURIs[i].fsPath)) {
			var oldJSON = fs.readFileSync(JSONFileURIs[i].fsPath, "utf-8");
			JSONSetup.push(JSON.parse(oldJSON));
		}	
	}	
	return (JSONSetup);
}
function GetFullPathFileJSONS() {
	var returnedNames = [];
	var FullPathFileJSONS = [];
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		returnedNames = ExtConf.get('JAMDiagnostics.FilePath');
		if (!Array.isArray(returnedNames))
		{
			vscode.window.showErrorMessage('JAMDiagnostics: Change in extension setup FilePath parameter from string to array.');
			return [];
		}
		for (let i = 0; i < returnedNames.length; i++) {
			FullPathFileJSONS.push(vscode.Uri.file(returnedNames[i]));
		}	
	}
	return (FullPathFileJSONS);
}
function getRules()
{
	var rules = [];
	var setupJSON = GetAllSetupJSON();	
	if (setupJSON) {
		for (let i = 0; i < setupJSON.length; i++) {
			pushObjectElementsToObject(setupJSON[i].rules,rules);
		}				
	}
	return (rules);
}
function getRuleSets()
{
	var ruleSets = [];
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		for (let i = 0; i < setupJSON.length; i++) {			
			pushObjectElementsToObject(setupJSON[i].rulesets,ruleSets);
		}				
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
		let rule = allRules.find(x => x.name === ruleSet.rules[i]);
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
	var fixSets = [];
	var setupJSON = GetAllSetupJSON();
	for (let i = 0; i < setupJSON.length; i++) {			
		pushObjectElementsToObject(setupJSON[i].fixsets,fixSets);
	}				
	return (fixSets);
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
	for (let i = 0; i < setupJSON.length; i++) {			
		pushObjectElementsToObject(setupJSON[i].diagnostics,diagnostics);
	}				

	return (diagnostics);
}
function getDiagnosticSets()
{
	var diagnosticSets = [];
	var setupJSON = GetAllSetupJSON();
	for (let i = 0; i < setupJSON.length; i++) {			
		pushObjectElementsToObject(setupJSON[i].dianosticsets,diagnosticSets);
	}				

	return (diagnosticSets);
}
function getFixesFromFixSetName(fixSetName)
{
	var fixes = [];
	var allFixes = getFixes();
	var fixSets = getFixSets();
	let fixSet = fixSets.find(x => x.name === fixSetName);
	for (let i = 0; i < fixSet.fixes.length; i++) {
		let fix = allFixes.find(x => x.name === fixSet.fixes[i]);
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
	for (let i = 0; i < setupJSON.length; i++) {			
		pushObjectElementsToObject(setupJSON[i].fixes,fixes);
	}				

	return (fixes);
}
function getFileExtensionFormRuleSetName(ruleSetName)
{
	var fileExtension = '';
	var ruleSets = getRuleSets();
	let ruleSet = ruleSets.find(x => x.name === ruleSetName);
	if (ruleSet) {
		fileExtension = ruleSet.fileExtension;
		if (!fileExtension) {
			vscode.window.showErrorMessage('No file extension mandatory property defined for ruleset ' + ruleSetName);
		}
	}
	return (fileExtension);
}
function pushObjectElementsToObject(source,target)
{
	for (let i = 0; i < source.length; i++) {
		target.push(source[i]);
		}	

}