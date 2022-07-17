const vscode = require('vscode');
module.exports = {
    pickAndApllyAfixSetName: async function () {
        pickAndApllyAfixSetName();
    }
}

function pickAndApllyAfixSetName() {
    const getRuls = require('./getRules.js');    
    const fixSets = getRuls.getFixSets();
    let fixSetNames = [];
    for (let i = 0; i < fixSets.length; i++) {
        fixSetNames.push(fixSets[i].name);
    }
    //show vscode code picker with the ruleSetNames        
    vscode.window.showQuickPick(fixSetNames).then(async (value) => {
        if (value) {
            await applyAllFixes(value);
        }
    }
    );

}
async function applyAllFixes(fixSetName) {
    const AppUri = vscode.workspace.workspaceFile;
    const getRuls = require('./getRules.js');
    const fixes = getRuls.getFixesFromFixSetName(fixSetName);
    const AppDiagnostics = vscode.languages.getDiagnostics(AppUri);
    for (let i = 0; i < AppDiagnostics.length; i++) {
        let diagnostic = AppDiagnostics[i];
        let fix = fixes.find(fix => fix.code === diagnostic.code);
        if (fix) {
            await applyFixToDiagnostic(diagnostic, fix);
        }
    }    
}

async function applyFixToDiagnostic(diagnostic, fix) {
    let edit = new vscode.WorkspaceEdit();
    let document = await vscode.workspace.openTextDocument(diagnostic.uri);
    let range = new vscode.Range(diagnostic.range.start.line, diagnostic.range.start.character, diagnostic.range.end.line, diagnostic.range.end.character);
    const RegEx = new RegExp(fix.searchExpresion, 'gi');
    const newLineText = document.lineAt(diagnostic.range.start.line).text.replace(RegEx,fix.replaceExpression);
    if (newLineText === document.lineAt(diagnostic.range.start.line).text) {
        return;
    }
    edit.replace(diagnostic.uri, range, newLineText);
    await vscode.workspace.applyEdit(edit);
}
