const vscode = require('vscode');
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
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

async function replaceRulesInAllDocuments(rules, fileExtension,ruleSetName='') {
    //const getRules = require('./getRules.js');
    //let rules = getRules.getRules();
    if (!rules) {
        return;
    }
    if (getSaveAfterApply(ruleSetName))
    {
        OutputChannel.clear();
        OutputChannel.show();    
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

                    await replaceRuleInDocument(customRule, document,ruleSetName);
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
async function replaceRuleInDocument(replaceRule, document,ruleSetName='') {
    replaceRuleInRange(replaceRule,document,new vscode.Range(0, 0, document.lineCount, 0),ruleSetName);
}
async function replaceRuleInRange(replaceRule, document,replaceRange=new vscode.Range(0,0,0,0),ruleSetName='') {
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
    if (getSaveAfterApply(ruleSetName))
    {
        document.save();
        OutputChannel.appendLine(replaceRule.name + ' applied in ' + document.uri);
        
    }    
}
function pickAndExcuteRuleset() {
    const getRules = require('./getRules.js');
    const ruleSetNames = getRuleSetNames('');
    //show vscode code picker with the ruleSetNames        
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            let rules = getRules.getRulesFromRuleSetName(value);
            const fileExtension = getRules.getFileExtensionFormRuleSetName(value);
            await replaceRulesInAllDocuments(rules, fileExtension,value);
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
async function pickAndExcuteRulesetICurrDoc() {
    const getRules = require('./getRules.js');    
    const currFileExtension = getFileExtensionFromFileName(await vscode.window.activeTextEditor.document.fileName);
    let ruleSetNames = getRuleSetNames(currFileExtension);    
    //show vscode code picker with the ruleSetNames        
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            let rules = getRules.getRulesFromRuleSetName(value);
            await replaceRulesInCurrDoc(rules);
        }
    }
    );
}
async function pickAndExcuteRulesetICurrDocSelection() {
    const getRules = require('./getRules.js');    
    const currFileExtension = getFileExtensionFromFileName(await vscode.window.activeTextEditor.document.fileName);
    let ruleSetNames = getRuleSetNames(currFileExtension);    
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

        await replaceRuleInDocument(customRule, document,'');
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

        await replaceRuleInRange(customRule, document,selectioRange,'');
    }
}
function getRuleSetNames(fileExtension='')
{
    const getRules = require('./getRules.js');
    let ruleSets = getRules.getRuleSets();    
    if (fileExtension !=='')
    {
        ruleSets = filterRuleSets(ruleSets,fileExtension);
    }
    if (!ruleSets) {
        return[];
    }
    let ruleSetNames = [];
    for (let i = 0; i < ruleSets.length; i++) {
        ruleSetNames.push(ruleSets[i].name);
    }
    return ruleSetNames;
}
function filterRuleSets(ruleSets={},currFileExtension='')
{
    return ruleSets.filter(ruleSetName => ruleSetName.fileExtension === currFileExtension);
}
function getFileExtensionFromFileName(fileName='')
{
    return fileName.split('.').pop();
}
function getSaveAfterApply(ruleSetName='')
{
    if (ruleSetName == '')
    {
        return false;
    }
    const getRules = require('./getRules.js');
    const ruleSets = getRules.getRuleSets();
	let ruleSet = ruleSets.find(x => x.name === ruleSetName);
	if (!ruleSet) {
		return false;
	}
    if (!ruleSet.saveAfterApply)
    {
        return false;
    }
    return true;
}