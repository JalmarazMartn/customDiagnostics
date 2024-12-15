const vscode = require('vscode');
let lastPickedItem = '';
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
module.exports = {
    replaceRulesInAllDocuments: function () {
        //replaceAllRulesInAllDocuments()
        pickAndExcuteRuleset();
    },
    replaceRulesInCurrentDoc: function () {
        pickAndExcuteRulesetICurrDoc()
    },
    replaceRulesInCurrDocSelection: function () {
        pickAndExcuteRulesetICurrDocSelection();
    },
    getNewText: function (originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName, document, range) {
        return getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName, document, range)
    },
    emptySearchexpressionError: function (searchExpresion, ruleName) {
        return emptySearchexpressionError(searchExpresion, ruleName);
    },
    placeLastSelectionInTop: function (ruleSetNames, lastPickedItem) {
        placeLastSelectionInTop(ruleSetNames, lastPickedItem);
    }
}

async function replaceRulesInAllDocuments(rules, fileExtension, ruleSetName = '') {
    //const getRules = require('./getRules.js');
    //let rules = getRules.getRules();
    if (!rules) {
        return;
    }
    OutputChannel.clear();
    OutputChannel.show();
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
                    for (let index = 0; index < 2; index++) {
                        await replaceRuleInDocument(customRule, document, ruleSetName);
                    }
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
async function replaceRuleInDocument(replaceRule, document, ruleSetName = '') {
    await replaceRuleInRange(replaceRule, document, new vscode.Range(0, 0, document.lineCount, 0), ruleSetName);
}
async function replaceRuleInRange(replaceRule, document, replaceRange = new vscode.Range(0, 0, 0, 0), ruleSetName = '') {
    for (let index = 0; index < getNumberOfRepetitions(replaceRule); index++) {
        await replaceRuleInRangeOnce(replaceRule, document, replaceRange, ruleSetName);
    }

}
async function replaceRuleInRangeOnce(replaceRule, document, replaceRange = new vscode.Range(0, 0, 0, 0), ruleSetName = '') {
    if (!replaceRule) {
        return;
    }
    if (emptySearchexpressionError(replaceRule.searchExpresion, replaceRule.name)) {
        return;
    }
    try {
        const regex = new RegExp(replaceRule.searchExpresion, 'mgi');
    }
    catch (error) {
        showErrorRegExp(replaceRule.name, error);
        return;
    }
    const regex = new RegExp(replaceRule.searchExpresion, 'mgi');
    if (document.getText().search(regex) < 0) {
        return;
    }
    let originalText = document.getText(replaceRange);

    const replaceText = getNewText(originalText, replaceRule.searchExpresion, replaceRule.replaceExpression,
        replaceRule.jsModuleFilePath, replaceRule.jsFunctionName, document, replaceRange);

    if (replaceText === originalText) {
        return;
    }
    let edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, replaceRange, replaceText);
    await vscode.workspace.applyEdit(edit);
    if (getSaveAfterApply(ruleSetName)) {
        document.save();
    }
    OutputChannel.appendLine(replaceRule.name + ' applied in ' + document.uri);
}
function pickAndExcuteRuleset() {
    const getRules = require('./getRules.js');
    const ruleSetNames = getRuleSetNames('', 'workspace');
    //show vscode code picker with the ruleSetNames
    placeLastSelectionInTop(ruleSetNames, lastPickedItem);
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            lastPickedItem = value;
            let rules = getRules.getRulesFromRuleSetName(value);
            const fileExtension = getRules.getFileExtensionFormRuleSetName(value);
            await replaceRulesInAllDocuments(rules, fileExtension, value);
        }
    }
    );
}
function getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName, document, range = new vscode.Range(0, 0, 0, 0)) {
    const existsReplaceExpr = replaceExpression !== undefined;
    let newText = originalText;
    const regex = new RegExp(searchExpresion, 'mgi');

    if (jsModuleFilePath) {
        if (jsFunctionName) {
            try {
                var fn = new Function();
                const jsModule = require(jsModuleFilePath);
                fn = jsModule[jsFunctionName];
                var setDocumentAndRange = new Function();
                setDocumentAndRange = jsModule['setDocumentAndRange'];
                if (setDocumentAndRange) {
                    setDocumentAndRange(document, range);
                }
                newText = originalText.replace(regex, fn);
                var getDocument = new Function();
                getDocument = jsModule['getDocument'];
                if (getDocument) {
                    document = getDocument();
                }
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
    let ruleSetNames = getRuleSetNames(currFileExtension, 'document');
    //show vscode code picker with the ruleSetNames        
    placeLastSelectionInTop(ruleSetNames, lastPickedItem);
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            lastPickedItem = value;
            let rules = getRules.getRulesFromRuleSetName(value);
            await replaceRulesInCurrDoc(rules);
        }
    }
    );
}
function placeLastSelectionInTop(ruleSetNames, lastPickedItem) {
    const indexToRemove = ruleSetNames.indexOf(lastPickedItem);
    if (indexToRemove >= 0) {
        ruleSetNames.splice(indexToRemove, 1);
        ruleSetNames.unshift(lastPickedItem);
    }
}
async function pickAndExcuteRulesetICurrDocSelection() {
    const getRules = require('./getRules.js');
    const currFileExtension = getFileExtensionFromFileName(await vscode.window.activeTextEditor.document.fileName);
    let ruleSetNames = getRuleSetNames(currFileExtension, 'selection');
    //show vscode code picker with the ruleSetNames        
    placeLastSelectionInTop(ruleSetNames, lastPickedItem);
    vscode.window.showQuickPick(ruleSetNames).then(async (value) => {
        if (value) {
            lastPickedItem = value;
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

        await replaceRuleInDocument(customRule, document, '');
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

        await replaceRuleInRange(customRule, document, selectioRange, '');
    }
}
function getRuleSetNames(fileExtension = '', scope = '') {
    const getRules = require('./getRules.js');
    let ruleSets = getRules.getRuleSets();
    if (fileExtension !== '') {
        ruleSets = filterRuleSets(ruleSets, fileExtension);
    }
    if (!ruleSets) {
        return [];
    }
    let ruleSetNames = [];
    for (let i = 0; i < ruleSets.length; i++) {
        if (GetApplyScope(ruleSets[i], scope)) {
            ruleSetNames.push(ruleSets[i].name);
        }
    }
    return ruleSetNames;
}
function filterRuleSets(ruleSets = {}, currFileExtension = '') {
    return ruleSets.filter(ruleSetName => ruleSetName.fileExtension === currFileExtension || ruleSetName.fileExtension === '');
}
function GetApplyScope(ruleSet = {}, scope = '') {
    if (!ruleSet.scope) {
        return true;
    }
    if (ruleSet.scope.length == 0) {
        return true;
    }
    for (let index = 0; index < ruleSet.scope.length; index++) {
        if (ruleSet.scope[index] == scope) {
            return true;
        }
    }
    return false;
}
function getFileExtensionFromFileName(fileName = '') {
    return fileName.split('.').pop();
}
function getSaveAfterApply(ruleSetName = '') {
    if (ruleSetName == '') {
        return false;
    }
    const getRules = require('./getRules.js');
    const ruleSets = getRules.getRuleSets();
    let ruleSet = ruleSets.find(x => x.name === ruleSetName);
    if (!ruleSet) {
        return false;
    }
    if (!ruleSet.saveAfterApply) {
        return false;
    }
    return true;
}
function showErrorRegExp(ruleName = '', errorRaised) {
    const finalMessage = 'JAMCustomDiagnostics, error parsing rule ' + ruleName + ' : ' + errorRaised.toString();
    vscode.window.showErrorMessage(finalMessage);
    OutputChannel.appendLine(finalMessage);
}
function getNumberOfRepetitions(replaceRule) {
    if (replaceRule.numberOfRepetitions) {
        return replaceRule.numberOfRepetitions;
    }
    return 1;
}