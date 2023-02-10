const vscode = require('vscode');

class rulesEditionCheckingClass {
    constructor() {
        this.provideCodeActions = function (document, range, context, token) {
            const getRules = require('./getRules.js');
            let currFixes = [];
            let diagnostics = context.diagnostics;
            if (!diagnostics) {
                return [];
            }
            for (let i = 0; i < diagnostics.length; i++) {
                let diagnostic = diagnostics[i];
                const allFixes = getRules.getFixes();
                allFixes
                    .filter(fix => fix.code === diagnostic.code.value)
                    .map(fix => currFixes.push(this.createCommandCodeAction(diagnostic, fix)));
            }
            return currFixes;
        }
    }
    createCommandCodeAction(diagnostic, fix, document) {
        if (!document) { document = vscode.window.activeTextEditor.document; }
        const replace = require('./replace.js');
        //const newText = document.lineAt(diagnostic.range.start.line).text.replace(searchRegex,fix.replaceExpression);
        const newText = replace.getNewText(document.lineAt(diagnostic.range.start.line).text, fix.searchExpresion,
            fix.replaceExpression, fix.jsModuleFilePath, fix.jsFunctionName);
        if (newText === document.lineAt(diagnostic.range.start.line).text) {
            return;
        }
        const action = new vscode.CodeAction(fix.name, vscode.CodeActionKind.QuickFix);
        //action.command = { command: COMMAND, title: 'Learn more about transferfields', tooltip: 'This will open the transferfields page.' };
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        action.edit = new vscode.WorkspaceEdit();
        let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line + 1, 0);
        action.edit.replace(document.uri, range, newText);
        return action;
    }
};
module.exports = {
    rulesEditionCheckingClass: rulesEditionCheckingClass,
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) },
    selectRuleInRuleSet: function () { return selectRuleInRuleSet(); }
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
    const commandName = 'Get an existing rule';
    if (!getIsEditingRules()) {
        return;
    }
    const commandCompletion = new vscode.CompletionItem(commandName);
    commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    //commandCompletion.filterText = commandName;
    commandCompletion.label = commandName;
    //commandCompletion.label = await getSnippetWithRules();
    commandCompletion.insertText = new vscode.SnippetString(await getSnippetWithRules());
    commandCompletion.detail = 'Get an existing rule';
    commandCompletion.documentation = '';    
    return [commandCompletion];
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
async function getSnippetWithRules() {
    let SnippetWithRules = '';
    const getRules = require('./getRules.js');
    let allRules = getRules.getRules();
    for (let i = 0; i < allRules.length; i++) {
        if (SnippetWithRules !== '') {
            SnippetWithRules = SnippetWithRules + ',';
        }
        SnippetWithRules += convertElementToSnippetText(allRules[i].name);
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
function isObjectKeyRulesInLine(lineText='')
{
    return lineText.search(/"rules"\s*:/) !== -1
}