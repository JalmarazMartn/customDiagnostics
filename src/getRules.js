module.exports = {
	  getSetupJSON: function () {
		  return (GetAllSetupJSON());
		},
		getRules: function () {
			return (getRules());
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
		rules = setupJSON[0].rules;
	}
	return (rules);
}
