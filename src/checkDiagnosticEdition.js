const vscode = require('vscode');

module.exports = {    
    subscribeToDocumentChanges: function (context, customDiagnostic) { subscribeToDocumentChanges(context, customDiagnostic) },
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) },
    selectDiagnosticInSet: function () { return selectDiagnosticInSet(); }
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
    const rulesNotDefined = getDiagnosticsNotDefined();
    if (rulesNotDefined.length == 0) {
        return;
    }
    for (let indexRule = 0; indexRule < rulesNotDefined.length; indexRule++) {
        customRule.searchExpresion = rulesNotDefined[indexRule];
        customRule.message = "'" + rulesNotDefined[indexRule] + "' not defined in diagnostics above. Choose an existing one";
        let isCurrentObjectKeyRules = false;
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            if (isObjectKeyInLine(lineOfText.text)) {
                isCurrentObjectKeyRules = isObjectKeyDiagnosticsInLine(lineOfText.text);//find "rules":
            }
            if (isCurrentObjectKeyRules) {
                if (lineOfText.text.search(customRule.searchExpresion) !== -1) {
                    diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
                }
            }
        }
    }
}
function getDiagnosticsNotDefined() {
    let diagnosticsNotDefined = [];
    let currDocJSON = [];
    try {
        currDocJSON = JSON.parse(vscode.window.activeTextEditor.document.getText());
        //currDocJSON.push(JSON.parse(vscode.window.activeTextEditor.document.getText()));
    } catch (error) {
        return diagnosticsNotDefined;
    }
    const getRules = require('./getRules.js')
    let allDiagnostics = getRules.getDiagnostics();
    //Add curren docs rules.
    let currDocJSONArray = [];
    getRules.pushObjectElementsToObject(currDocJSON, currDocJSONArray);
    getRules.pushObjectElementsToObject(currDocJSON.diagnostics, allDiagnostics);
    const CurrDocDiagnosticCodesInSets = getCurrDocDiagnosticCodesInSets(currDocJSONArray);
    if (CurrDocDiagnosticCodesInSets.length == 0) {
        return [];
    }
    for (let index = 0; index < CurrDocDiagnosticCodesInSets.length; index++) {
        let rule = allDiagnostics.find(x => x.code === CurrDocDiagnosticCodesInSets[index]);
        if (!rule) {
            diagnosticsNotDefined.push(CurrDocDiagnosticCodesInSets[index]);
        }

    }
    return diagnosticsNotDefined;
}
function createDiagnostic(doc, lineOfText, lineIndex, customRule) {
    const cust = require('./customerDiagnostics.js');
    return cust.createDiagnostic(doc, lineOfText, lineIndex, customRule);
}
function getCurrDocDiagnosticCodesInSets(currDocJSON) {
    let diagnosticCodes = [];
    const getRules = require('./getRules.js');
    const diagnosticSets = getRules.getDiagnosticSetsFromJSON(currDocJSON);
    if (diagnosticSets.length == 0) {
        return [];
    }
    for (let index = 0; index < diagnosticSets.length; index++) {
        for (let index2 = 0; index2 < diagnosticSets[index].diagnostics.length; index2++) {
            diagnosticCodes.push(diagnosticSets[index].diagnostics[index2]);
        }
    }
    return diagnosticCodes;
}

async function selectDiagnosticInSet() {
    const commandName = 'Get an existing diagnostic';    
    if (!getIsEditingDiagnostics()) {
        return;
    }
    const commandCompletion = new vscode.CompletionItem(commandName);
    commandCompletion.kind = vscode.CompletionItemKind.Snippet;
    //commandCompletion.filterText = commandName;
    commandCompletion.label = commandName;
    //commandCompletion.label = await getSnippetWithRules();
    commandCompletion.insertText = new vscode.SnippetString(await getSnippetWithDiagnostics());
    commandCompletion.detail = 'Get an existing diagnostic';
    commandCompletion.documentation = '';    
    return [commandCompletion];
}
function getIsEditingDiagnostics() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        //get current position line in document
        const currentlineNumber = editor.selection.start.line;

        for (let i = currentlineNumber; i > 0; i--) {
            const line = document.lineAt(i - 1);
            if (isObjectKeyInLine(line.text))
            {
                return isObjectKeyDiagnosticsInLine(line.text);
            }
        }
        return false;
    }

}
async function getSnippetWithDiagnostics() {
    let SnippetWithDiagnostics = '';
    const getRules = require('./getRules.js');
    let allDiagnostics = getRules.getDiagnostics();
    for (let i = 0; i < allDiagnostics.length; i++) {
        if (SnippetWithDiagnostics !== '') {
            SnippetWithDiagnostics = SnippetWithDiagnostics + ',';
        }
        SnippetWithDiagnostics += convertElementToSnippetText(allDiagnostics[i].code);
    }
    SnippetWithDiagnostics = '${1|' + SnippetWithDiagnostics + '|}';
    return SnippetWithDiagnostics;
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
function isObjectKeyDiagnosticsInLine(lineText='')
{
    return lineText.search(/"diagnostics"\s*:/) !== -1
}