const vscode = require('vscode');

module.exports = {    
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) },
    selectRuleInRuleSet: function () { return selectRuleInRuleSet(); },
    tryAndPushRegex: function(invalidRegexps, regexToTest, ruleName, ruleSection,regexOptions)
    { tryAndPushRegex(invalidRegexps, regexToTest, ruleName, ruleSection,regexOptions); },
    getRegexOptions: function(element){return getRegexOptions(element)}
}

function subscribeToDocumentChanges(context, customDiagnostic) {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, customDiagnostic);
    }
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(editor.document, customDiagnostic);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, customDiagnostic))
    );
    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            customDiagnostic.delete(doc.uri)
        })
    );
}

function refreshDiagnostics(doc, customDiagnostic) {
    let diagnostics = [];
    findDiagnosticInDocument(doc, diagnostics);
    addInvalidRegExps(doc, diagnostics);
    customDiagnostic.set(doc.uri, diagnostics);
}
function findDiagnosticInDocument(doc, diagnostics) {
    const customRule = {
        "language": "json",
        "severity": "error",
        "message": "",
        "searchExpresion": ""
    };
    if (customRule.language) {
        if (customRule.language !== doc.languageId) {
            return;
        }
    }
    const rulesNotDefined = getRulesNotDefined();
    if (rulesNotDefined.length == 0) {
        return;
    }
    for (let indexRule = 0; indexRule < rulesNotDefined.length; indexRule++) {
        customRule.searchExpresion = rulesNotDefined[indexRule];
        customRule.message = "'" + rulesNotDefined[indexRule] + "' not defined in rules above. Choose an existing one";
        let isCurrentObjectKeyRules = false;
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            //const existsObjectKeyInLine = lineOfText.text.search(/".*"\s*:/) !== -1;//find "ObjectKey":
            if (isObjectKeyInLine(lineOfText.text)) {
                //isCurrentObjectKeyRules = lineOfText.text.search(/"rules"\s*:/) !== -1;//find "rules":
                isCurrentObjectKeyRules = isObjectKeyRulesInLine(lineOfText.text);//find "rules":
            }
            if (isCurrentObjectKeyRules) {
                if (lineOfText.text.search(customRule.searchExpresion) !== -1) {
                    diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
                }
            }
        }
    }
}
function getRulesNotDefined() {
    let rulesNotDefined = [];
    let currDocJSON = [];
    try {
        currDocJSON = JSON.parse(vscode.window.activeTextEditor.document.getText());
        //currDocJSON.push(JSON.parse(vscode.window.activeTextEditor.document.getText()));
    } catch (error) {
        return rulesNotDefined;
    }
    const getRules = require('./getRules.js')
    let allRules = getRules.getRules();
    //Add curren docs rules.
    let currDocJSONArray = [];
    getRules.pushObjectElementsToObject(currDocJSON, currDocJSONArray);
    getRules.pushObjectElementsToObject(currDocJSON.rules, allRules);
    const CurrDocRulesNamesInRulesets = getCurrDocRuleNamesInRulesets(currDocJSONArray);
    if (CurrDocRulesNamesInRulesets.length == 0) {
        return [];
    }
    for (let index = 0; index < CurrDocRulesNamesInRulesets.length; index++) {
        let rule = allRules.find(x => x.name === CurrDocRulesNamesInRulesets[index]);
        if (!rule) {
            rulesNotDefined.push(CurrDocRulesNamesInRulesets[index]);
        }

    }
    return rulesNotDefined;
}
function createDiagnostic(doc, lineOfText, lineIndex, customRule) {
    const cust = require('./customerDiagnostics.js');
    return cust.createDiagnostic(doc, lineOfText, lineIndex, customRule);
}
function getCurrDocRuleNamesInRulesets(currDocJSON) {
    let ruleNames = [];
    const getRules = require('./getRules.js');
    const ruleSets = getRules.getRuleSetsFromJSON(currDocJSON);
    if (ruleSets.length == 0) {
        return [];
    }
    for (let index = 0; index < ruleSets.length; index++) {
        for (let index2 = 0; index2 < ruleSets[index].rules.length; index2++) {
            ruleNames.push(ruleSets[index].rules[index2]);
        }
    }
    return ruleNames;
}
async function selectRuleInRuleSet() {
    let commandCompletion = [];
    if (!getIsEditingRules()) {
        return;
    }
    const getRules = require('./getRules.js');
    let allRules = getRules.getRules();
    for (let index = 0; index < allRules.length; index++) {
        commandCompletion.push(new vscode.CompletionItem(convertElementToSnippetText(allRules[index].name), vscode.CompletionItemKind.Snippet));
    }
    return commandCompletion;
}
function addInvalidRegExps(doc, diagnostics)
{
    let currDocJSON = [];
    try {
        currDocJSON = JSON.parse(vscode.window.activeTextEditor.document.getText());
    } catch (error) {
        return;
    }
    let docFixes = currDocJSON.rules;
    const customRule = {
        "language": "json",
        "severity": "error",
        "message": "",
        "searchExpresion": ""
    };
    if (customRule.language) {
        if (customRule.language !== doc.languageId) {
            return;
        }
    }
    const invalidRegexps = getInvalidRegexps(docFixes);
    if (!invalidRegexps) { return }
    if (invalidRegexps.length == 0) {
        return;
    }
    for (let indexRule = 0; indexRule < invalidRegexps.length; indexRule++) {
        customRule.searchExpresion = invalidRegexps[indexRule].searchExpresion;
        customRule.message = "'" + invalidRegexps[indexRule].searchExpresion + ' ' + invalidRegexps[indexRule].error + "'";
        let isInvalidName = false;
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            const isNameline = lineOfText.text.search('"name"') !== -1;
            if (isNameline) {
                isInvalidName = lineOfText.text.search(invalidRegexps[indexRule].name) !== -1;
            }
            if (isInvalidName) {
                if (lineOfText.text.search(invalidRegexps[indexRule].searchExpresion) !== -1) {
                    diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
                }
            }
        }
    }
}
function getInvalidRegexps(docRepRules=[]) {
    let invalidRegexps = [];
    for (let index = 0; index < docRepRules.length; index++) {
        const element = docRepRules[index];
        if (element.searchExpresion) {
            tryAndPushRegex(invalidRegexps, element.searchExpresion, element.name, 'searchExpresion',getRegexOptions(element))
        }
    }
    return invalidRegexps;
}
function tryAndPushRegex(invalidRegexps, regexToTest = '', ruleName, ruleSection = '',regexOptions='') {
    const defaultRegexOptions = getDefaultRegexOptions();
    try {
        const regex = new RegExp(regexToTest, defaultRegexOptions);
    }
    catch (error) {
        invalidRegexps.push(
            {
                "name": ruleName,
                "searchExpresion": ruleSection,
                "error": error.toString()
            }
        );
    }
    if (regexOptions!==defaultRegexOptions) {
        try {
            const regex = new RegExp(regexToTest, regexOptions);
        }
        catch (error) {
            invalidRegexps.push(
                {
                    "name": ruleName,
                    "searchExpresion": "regexOptions",
                    "error": error.toString()
                }
            );
        }    
    }
}
function getIsEditingRules() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        //get current position line in document
        const currentlineNumber = editor.selection.start.line;

        for (let i = currentlineNumber; i > 0; i--) {
            const line = document.lineAt(i - 1);
            if (isObjectKeyInLine(line.text))
            {
                return isObjectKeyRulesInLine(line.text);
            }
        }
        return false;
    }

}
function convertElementToSnippetText(SourceElement = '') {
    let ConvertedElement = '"' + SourceElement + '"';
    // @ts-ignore
    ConvertedElement = ConvertedElement.replaceAll('"', '\"');
    // @ts-ignore
    ConvertedElement = ConvertedElement.replaceAll(',', '\\,');
    // @ts-ignore
    ConvertedElement = ConvertedElement.replaceAll(')', '');
    // @ts-ignore	
    ConvertedElement = ConvertedElement.replaceAll('\\', '/');

    return ConvertedElement;
}
function isObjectKeyInLine(lineText='')
{
    return (lineText.search(/".*"\s*:/) !== -1)
}
function isObjectKeyRulesInLine(lineText='')
{
    return lineText.search(/"rules"\s*:/) !== -1
}
function getRegexOptions(element) {
    if (element.regexOptions) {
        if (element.regexOptions !== '') {
        return element.regexOptions;
    }
    }
    return getDefaultRegexOptions();
}
function getDefaultRegexOptions()
{
    const regexHelper = require('./regexHelper.js');
    return regexHelper.getDefaultRegexOptions();
}