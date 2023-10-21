const vscode = require('vscode');

module.exports = {    
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) },
    selectFixInFixSet: function () { return selectFixInFixSet(); }
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
    const fixesNotDefined = getFixesNotDefined();
    if (fixesNotDefined.length == 0) {
        return;
    }
    for (let indexRule = 0; indexRule < fixesNotDefined.length; indexRule++) {
        customRule.searchExpresion = fixesNotDefined[indexRule];
        customRule.message = "'" + fixesNotDefined[indexRule] + "' not defined in fixes above. Choose an existing one";
        let isCurrentObjectKeyFixes = false;
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            if (isObjectKeyInLine(lineOfText.text)) {
                isCurrentObjectKeyFixes = isObjectKeyFixesInLine(lineOfText.text);//find "rules":
            }
            if (isCurrentObjectKeyFixes) {
                if (lineOfText.text.search(customRule.searchExpresion) !== -1) {
                    diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
                }
            }
        }
    }
}
function addInvalidRegExps(doc, diagnostics)
{
    let currDocJSON = [];
    try {
        currDocJSON = JSON.parse(vscode.window.activeTextEditor.document.getText());
    } catch (error) {
        return;
    }
    let docFixes = currDocJSON.fixes;
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
function getInvalidRegexps(docDiagnostics=[]) {
    let invalidRegexps = [];
    for (let index = 0; index < docDiagnostics.length; index++) {
        const element = docDiagnostics[index];
        if (element.searchExpresion) {
            tryAndPushRegex(invalidRegexps, element.searchExpresion, element.name, 'searchExpresion')
        }
    }
    return invalidRegexps;
}
function tryAndPushRegex(invalidRegexps, regexToTest = '', ruleName, ruleSection = '') {
    try {
        const regex = new RegExp(regexToTest, 'mgi');
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
}

function getFixesNotDefined() {
    let fixesNotDefined = [];
    let currDocJSON = [];
    try {
        currDocJSON = JSON.parse(vscode.window.activeTextEditor.document.getText());
        //currDocJSON.push(JSON.parse(vscode.window.activeTextEditor.document.getText()));
    } catch (error) {
        return fixesNotDefined;
    }
    const getRules = require('./getRules.js')
    let allFixes = getRules.getFixes();
    //Add curren docs rules.
    let currDocJSONArray = [];
    getRules.pushObjectElementsToObject(currDocJSON, currDocJSONArray);
    getRules.pushObjectElementsToObject(currDocJSON.fixes, allFixes);
    const CurrDocFixesNamesInSets = getCurrDocFixNamesInSets(currDocJSONArray);
    if (CurrDocFixesNamesInSets.length == 0) {
        return [];
    }
    for (let index = 0; index < CurrDocFixesNamesInSets.length; index++) {
        let rule = allFixes.find(x => x.name === CurrDocFixesNamesInSets[index]);
        if (!rule) {
            fixesNotDefined.push(CurrDocFixesNamesInSets[index]);
        }

    }
    return fixesNotDefined;
}
function createDiagnostic(doc, lineOfText, lineIndex, customRule) {
    const cust = require('./customerDiagnostics.js');
    return cust.createDiagnostic(doc, lineOfText, lineIndex, customRule);
}
function getCurrDocFixNamesInSets(currDocJSON) {
    let fixNames = [];
    const getRules = require('./getRules.js');
    const fixSets = getRules.getFixSetsFromJSON(currDocJSON);
    if (fixSets.length == 0) {
        return [];
    }
    for (let index = 0; index < fixSets.length; index++) {
        for (let index2 = 0; index2 < fixSets[index].fixes.length; index2++) {
            fixNames.push(fixSets[index].fixes[index2]);
        }
    }
    return fixNames;
}
async function selectFixInFixSet() {
    const commandName = 'Get an existing fix';
    if (!getIsEditingFixes()) {
        return;
    }
    const commandCompletion = new vscode.CompletionItem(commandName);
    commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    commandCompletion.label = commandName;
    commandCompletion.insertText = new vscode.SnippetString(await getSnippetWithFixes());
    commandCompletion.detail = 'Get an existing fix';
    commandCompletion.documentation = '';    
    return [commandCompletion];
}
function getIsEditingFixes() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        //get current position line in document
        const currentlineNumber = editor.selection.start.line;

        for (let i = currentlineNumber; i > 0; i--) {
            const line = document.lineAt(i - 1);
            if (isObjectKeyInLine(line.text))
            {
                return isObjectKeyFixesInLine(line.text);
            }
        }
        return false;
    }

}
async function getSnippetWithFixes() {
    let SnippetWithRules = '';
    const getRules = require('./getRules.js');
    let allFixes = getRules.getFixes();
    for (let i = 0; i < allFixes.length; i++) {
        if (SnippetWithRules !== '') {
            SnippetWithRules = SnippetWithRules + ',';
        }
        SnippetWithRules += convertElementToSnippetText(allFixes[i].name);
    }
    SnippetWithRules = '${1|' + SnippetWithRules + '|}';
    return SnippetWithRules;
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
function isObjectKeyFixesInLine(lineText='')
{
    return lineText.search(/"fixes"\s*:/) !== -1
}