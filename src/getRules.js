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
	},
	pushObjectElementsToObject: function (source, target) {
		pushObjectElementsToObject(source, target);
	},
	getRulesFromRuleSetNameFromJSON: function (ruleSetName, setupJSON) {
		return getRulesFromRuleSetNameFromJSON(ruleSetName, setupJSON)
	},
	getRulesFromJSON: function (setupJSON) {
		return getRulesFromJSON(setupJSON)
	},
	getRuleSetsFromJSON: function (setupJSON) {
		return getRuleSetsFromJSON(setupJSON)
	}
}
const vscode = require('vscode');
function GetAllSetupJSON() {
	var JSONSetup = [];
	const fs = require('fs');
	const JSONFileURIs = GetFullPathFileJSONS();
	if (!JSONFileURIs) {
		return [];
	}
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
		const mainFile = ExtConf.get('JAMDiagnostics.FilePath');
		if (mainFile) {
			FullPathFileJSONS.push(vscode.Uri.file(mainFile));
		}
		returnedNames = ExtConf.get('JAMDiagnostics.AdditionalFilePaths');
		if (returnedNames) {
			for (let i = 0; i < returnedNames.length; i++) {
				FullPathFileJSONS.push(vscode.Uri.file(returnedNames[i]));
			}
		}
	}
	return (FullPathFileJSONS);
}
function getRules() {
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		return getRulesFromJSON(setupJSON);
	}
	return ([]);
}
function getRulesFromJSON(setupJSON = []) {
	var rules = [];
	for (let i = 0; i < setupJSON.length; i++) {
		pushObjectElementsToObject(setupJSON[i].rules, rules);
	}
	return (rules);
}
function getRuleSets() {
	var setupJSON = GetAllSetupJSON();
	if (setupJSON) {
		return (getRuleSetsFromJSON(setupJSON))
	}
	return [];
}
function getRuleSetsFromJSON(setupJSON = []) {
	var ruleSets = [];
	for (let i = 0; i < setupJSON.length; i++) {
		pushObjectElementsToObject(setupJSON[i].rulesets, ruleSets);
	}

	return ruleSets;
}
function getRulesFromRuleSetName(ruleSetName) {
	var setupJSON = GetAllSetupJSON();
	if (!setupJSON) {
		return [];
	}
	return getRulesFromRuleSetNameFromJSON(ruleSetName, setupJSON);
}
function getRulesFromRuleSetNameFromJSON(ruleSetName = '', setupJSON = []) {
	var rules = [];
	var allRules = getRulesFromJSON(setupJSON);
	var ruleSets = getRuleSetsFromJSON(setupJSON);
	let ruleSet = ruleSets.find(x => x.name === ruleSetName);
	if (!ruleSet) {
		return [];
	}
	for (let i = 0; i < ruleSet.rules.length; i++) {
		let rule = allRules.find(x => x.name === ruleSet.rules[i]);
		if (rule) {
			rules.push(rule);
		}

	}
	return (rules);
}

function getDefaultDiagnostics() {
	let defaultDiagnosticRulesetNames = [];
	let diagnosticsFromDiagnosticSetName = [];
	let defaultDiagnosticRules = [];
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		defaultDiagnosticRulesetNames = ExtConf.get('JAMDiagnostics.DefaultDiagnosticRuleset');
		if (!defaultDiagnosticRulesetNames) {
			return [];
		}
		for (let indexRuleset = 0; indexRuleset < defaultDiagnosticRulesetNames.length; indexRuleset++) {
			diagnosticsFromDiagnosticSetName = getDiagnosticsFromDiagnosticSetName(defaultDiagnosticRulesetNames[indexRuleset]);
			for (let indexRule = 0; indexRule < diagnosticsFromDiagnosticSetName.length; indexRule++) {
				defaultDiagnosticRules.push(diagnosticsFromDiagnosticSetName[indexRule]);
			}
		}
	}
	return (defaultDiagnosticRules);
}
function getFixSets() {
	var fixSets = [];
	var setupJSON = GetAllSetupJSON();
	for (let i = 0; i < setupJSON.length; i++) {
		pushObjectElementsToObject(setupJSON[i].fixsets, fixSets);
	}
	return (fixSets);
}
function getDiagnosticsFromDiagnosticSetName(diagnosticSetName) {
	var diagnostics = [];
	if (diagnosticSetName == '') {
		return diagnostics;
	}
	var allDiagnostics = getDiagnostics();
	var diagnosticSets = getDiagnosticSets();
	let diagnosticSet = diagnosticSets.find(x => x.name === diagnosticSetName);
	if (!diagnosticSet) {
		vscode.window.showErrorMessage(diagnosticSetName + ' is not configured. Go to settings to create the diagnosticSet.');
		return diagnostics;
	}
	if (diagnosticSet.diagnostics) {
		for (let i = 0; i < diagnosticSet.diagnostics.length; i++) {
			let diagnostic = allDiagnostics.find(x => x.code === diagnosticSet.diagnostics[i]);
			if (diagnostic) {
				diagnostics.push(diagnostic);
			}
		}
	}
	return (diagnostics);
}
function getDiagnostics() {
	var diagnostics = [];
	var setupJSON = GetAllSetupJSON();
	for (let i = 0; i < setupJSON.length; i++) {
		if (setupJSON[i].diagnostics) {
			pushObjectElementsToObject(setupJSON[i].diagnostics, diagnostics);
		}
	}
	return (diagnostics);
}
function getDiagnosticSets() {
	var diagnosticSets = [];
	var setupJSON = GetAllSetupJSON();
	for (let i = 0; i < setupJSON.length; i++) {
		pushObjectElementsToObject(setupJSON[i].dianosticsets, diagnosticSets);//previous suntax error
		pushObjectElementsToObject(setupJSON[i].diagnosticsets, diagnosticSets);
	}
	return (diagnosticSets);
}
function getFixesFromFixSetName(fixSetName) {
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
function getFixes() {
	var fixes = [];
	var setupJSON = GetAllSetupJSON();
	for (let i = 0; i < setupJSON.length; i++) {
		pushObjectElementsToObject(setupJSON[i].fixes, fixes);
	}
	return (fixes);
}
function getFileExtensionFormRuleSetName(ruleSetName) {
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
function pushObjectElementsToObject(source, target) {
	if (!source) {
		return;
	}
	if (!source.length) {
		target.push(source);
		return;
	}
	for (let i = 0; i < source.length; i++) {
		target.push(source[i]);
	}
}