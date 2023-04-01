const vscode = require('vscode');
module.exports = {
    replaceRulesInAllDocuments: function () {
        //replaceAllRulesInAllDocuments()
        pickAndExcuteRuleset();
    },
    replaceRulesInCurrentDoc: function () {
        pickAndExcuteRulesetICurrDoc()
    },
    replaceRulesInCurrDocSelection: function()
    {
        pickAndExcuteRulesetICurrDocSelection();
    },
    getNewText: function (originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName) {
        return getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName)
    },
    emptySearchexpressionError: function (searchExpresion, ruleName) {
        return emptySearchexpressionError(searchExpresion, ruleName);
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
    replaceRuleInRange(replaceRule,document,new vscode.Range(0, 0, document.lineCount, 0));
}
async function replaceRuleInRange(replaceRule, document,replaceRange=new vscode.Range(0,0,0,0)) {
    if (!replaceRule) {
        return;
    }
    if (emptySearchexpressionError(replaceRule.searchExpresion, replaceRule.name)) {
        return;
    }
    const regex = new RegExp(replaceRule.searchExpresion, 'mgi');
    if (document.getText().search(regex) < 0) {
        return;
    }
    let originalText = document.getText(replaceRange);

    const replaceText = getNewText(originalText, replaceRule.searchExpresion, replaceRule.replaceExpression,
        replaceRule.jsModuleFilePath, replaceRule.jsFunctionName);

    if (replaceText === originalText) {
        return;
    }
    let edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, replaceRange, replaceText);
    await vscode.workspace.applyEdit(edit);
}
function pickAndExcuteRuleset() {
    const getRules = require('./getRules.js');
    const ruleSetNames = getRuleSetNames();
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
function getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName,) {
    const existsReplaceExpr = replaceExpression !== undefined;
    let newText = originalText;
    const regex = new RegExp(searchExpresion, 'mgi');
    if (jsModuleFilePath) {
        if (jsFunctionName) {
            try {
                var fn = new Function();
                const jsModule = require(jsModuleFilePath);
                fn = jsModule[jsFunctionName];
                newText = originalText.replace(regex, fn);
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
function emptySearchexpressionError(searchExpression, ruleName) {
    let emptySearchExpression = searchExpression == undefined;
    if (!emptySearchExpression) {
        emptySearchExpression = searchExpression == '';
    }
    if (emptySearchExpression) {
        vscode.window.showErrorMessage('You must set a serach expression in rule ' + ruleName);
    }
    return emptySearchExpression;
}
function pickAndExcuteRulesetICurrDoc() {
    const getRules = require('./getRules.js');    
    let ruleSetNames = getRuleSetNames();
    //show vscode code picker with the ruleSetNames        
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            let rules = getRules.getRulesFromRuleSetName(value);
            await replaceRulesInCurrDoc(rules);
        }
    }
    );
}
function pickAndExcuteRulesetICurrDocSelection() {
    const getRules = require('./getRules.js');    
    let ruleSetNames = getRuleSetNames();
    //show vscode code picker with the ruleSetNames        
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            let rules = getRules.getRulesFromRuleSetName(value);
            await replaceRulesInCurrDocSelection(rules);
        }
    }
    );
}
async function replaceRulesInCurrDoc(rules) {
    if (!rules) {
        return;
    }
    let document = await vscode.window.activeTextEditor.document;
    for (let i = 0; i < rules.length; i++) {
        let customRule = rules[i];

        await replaceRuleInDocument(customRule, document);
    }
}
async function replaceRulesInCurrDocSelection(rules) {
    if (!rules) {
        return;
    }
    let document = await vscode.window.activeTextEditor.document;
    let selectioRange = new vscode.Range(vscode.window.activeTextEditor.selection.start,
                vscode.window.activeTextEditor.selection.end);
    for (let i = 0; i < rules.length; i++) {
        let customRule = rules[i];

        await replaceRuleInRange(customRule, document,selectioRange);
    }
}
function getRuleSetNames()
{
    const getRules = require('./getRules.js');
    let ruleSets = getRules.getRuleSets();
    if (!ruleSets) {
        return[];
    }
    let ruleSetNames = [];
    for (let i = 0; i < ruleSets.length; i++) {
        ruleSetNames.push(ruleSets[i].name);
    }
    return ruleSetNames;
}