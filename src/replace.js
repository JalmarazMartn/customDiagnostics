const vscode = require('vscode');
module.exports = {
    replaceRulesInAllDocuments: function () {
        //replaceAllRulesInAllDocuments()
        pickAndExcuteRuleset();
    }
}

async function replaceRulesInAllDocuments(rules, fileExtension) {
    //const getRules = require('./getRules.js');
    //let rules = getRules.getRules();
    if (!rules) {
        return;
    }

    //show progress window
    vscode.window.withProgress({
        cancellable: true,
        location: vscode.ProgressLocation.Notification,
        title: 'Replacing rules in documents',
    }, async (progress) => {
        const documents = await vscode.workspace.findFiles('**/*.' + fileExtension);
        for (let j = 0; j < documents.length; j++) {
            try {
                let document = await vscode.workspace.openTextDocument(documents[j]);
                progress.report({ message: 'Replacing rules in document ' + document.fileName });
                for (let i = 0; i < rules.length; i++) {
                    let customRule = rules[i];

                    await replaceRuleInDocument(customRule, document);
                }
            }
            catch (error) {
                if (error.message.search(/binary/i) < 0) {
                    console.log(error);
                }
            }
        }
    })
}
async function replaceRuleInDocument(replaceRule, document) {
    if (!replaceRule) {
        return;
    }
    const regex = new RegExp(replaceRule.searchExpresion, 'mgi');
    if (document.getText().search(regex) < 0) {
        return;
    }
    const replaceText = getNewText(document.getText(), replaceRule.searchExpresion, replaceRule.replaceExpression,
        replaceRule.jsModuleFilePath, replaceRule.jsFunctionName,replaceRule.replaceExpression !== undefined);

    if (replaceText === document.getText()) {
        return;
    }
    let edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), replaceText);
    await vscode.workspace.applyEdit(edit);
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
            const fileExtension = getRules.getFileExtensionFormRuleSetName(value);
            await replaceRulesInAllDocuments(rules, fileExtension);
        }
    }
    );
}
function getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName,existsReplaceExpr=false) {
    let newText = originalText;
    const regex = new RegExp(searchExpresion, 'mgi');
    if (jsModuleFilePath) {        
        if (jsFunctionName) {
            try {
                var fn = new Function();
                const jsModule = require(jsModuleFilePath);
                fn = jsModule[jsFunctionName];
                newText = originalText.replace(regex,fn);
                }
            catch (error) {
                vscode.window.showErrorMessage('Error: ' + error.message);
            }
        }
    }
    if (existsReplaceExpr) {
        newText = originalText.replace(regex, replaceExpression);
    }    
    return newText;
}
