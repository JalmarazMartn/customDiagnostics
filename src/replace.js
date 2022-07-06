const vscode = require('vscode');
module.exports = {
    replaceRulesInAllDocuments: function () {
        //replaceAllRulesInAllDocuments()
        pickAndExcuteRuleset();
    }
}

async function replaceRulesInAllDocuments(rules) {
    //const getRules = require('./getRules.js');
    //let rules = getRules.getRules();
    if (!rules) {
        return;
    }
    for (let i = 0; i < rules.length; i++) {
        let customRule = rules[i];
        const documents = await vscode.workspace.findFiles('**/*.*');
        for (let j = 0; j < documents.length; j++) {
            try
            {
                let document = await vscode.workspace.openTextDocument(documents[j]);
                await replaceRuleInDocument(customRule, document);
            }
            catch (error) {
                if (error.message.search(/binary/i) < 0) {
                    console.log(error);
                }
            }
        }
    }
}
async function replaceRuleInDocument(customRule, document) {
    if (!customRule) {
        return;
    }
    if (customRule.language)
    {
        if (document.languageId !== customRule.language) {
            return;
        }
    }
    for (let i = 0; i < document.lineCount; i++) {
        let lineText = document.lineAt(i).text;
        const regex = new RegExp(customRule.searchExpresion, 'i');
        let replaceText = lineText.replace(regex, customRule.replaceExpression);
        if (replaceText != lineText) {
            let edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, new vscode.Range(i, 0, i, lineText.length), replaceText);
            await vscode.workspace.applyEdit(edit);
        }

    }
}
function pickAndExcuteRuleset() {
    const getRules = require('./getRules.js');
    let ruleSets = getRules.getRuleSets();
    if (!ruleSets) {
        return;
    }
    let ruleSetNames = [];
    for (let i = 0; i < ruleSets.length; i++) {
        ruleSetNames.push(ruleSets[i].name);
    }
    //show vscode code picker with the ruleSetNames        
	vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
		if (value) {
            let rules = getRules.getRulesFromRuleSetName(value);
            await replaceRulesInAllDocuments(rules);
        }
    }
    );
}