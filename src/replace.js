const vscode = require('vscode');
module.exports = {
    replaceAllRulesInAllDocuments: function () {
        replaceAllRulesInAllDocuments()
    }
}
async function replaceAllRulesInAllDocuments() {
    const getRules = require('./getRules.js');
    let CustomDiagnosticData = getRules.getRules();
    if (!CustomDiagnosticData) {
        return;
    }
    for (let i = 0; i < CustomDiagnosticData.length; i++) {
        let customRule = CustomDiagnosticData[i];
        const documents = await vscode.workspace.findFiles('**/*.al');
        for (let j = 0; j < documents.length; j++) {
            let document = await vscode.workspace.openTextDocument(documents[j]);
            await replaceRuleInDocument(customRule, document);
        }
    }
}
async function replaceRuleInDocument(customRule, document) {
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
