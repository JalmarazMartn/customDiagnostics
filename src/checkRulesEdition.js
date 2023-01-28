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
    refreshDiagnostics: function (doc, customDiagnostic) { refreshDiagnostics(doc, customDiagnostic) }
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
        "message": "Rule not defined",
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
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            if (lineOfText.text.search(customRule.searchExpresion) !== -1) {
                diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex, customRule));
            }
        }
    }
}
function getRulesNotDefined() {
    let rulesNotDefined = [];
    let currDocJSON = [];        
    try {
        currDocJSON = JSON.parse(vscode.window.activeTextEditor.document.getText());    
    } catch (error) {
        return rulesNotDefined;
    }    
    const getRules = require('./getRules.js')
    let allRules = getRules.getRules;
    //Add curren docs rules.
    getRules.pushObjectElementsToObject(currDocJSON.rules,allRules);    
    const CurrDocRulesInRulesets = getCurrDocRulesInRulesets(currDocJSON);
    return rulesNotDefined;
}
function createDiagnostic(doc, lineOfText, lineIndex, customRule) {
    const cust = require('./customerDiagnostics.js');
    return cust.createDiagnostic(doc, lineOfText, lineIndex, customRule);
}
function getCurrDocRulesInRulesets(currDocJSON)
{
}