module.exports = {
	  getRules: function () {
		  return (GetJSONRulesFromFile());
		}
}
const vscode = require('vscode');
function GetJSONRulesFromFile()
{
	var JSONRules = [];
	const fs = require('fs');
	const JSONFileURI = GetFullPathFileJSONS();
	if (fs.existsSync(JSONFileURI.fsPath)) {
		var oldJSON = fs.readFileSync(JSONFileURI.fsPath, "utf-8");
		JSONRules = JSON.parse(oldJSON);
	}
	return (JSONRules);
}
function GetFullPathFileJSONS() {
	var returnedName = '';
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		returnedName = ExtConf.get('JAMDiagnosticsFile');
	}
	return (vscode.Uri.file(returnedName));
}
