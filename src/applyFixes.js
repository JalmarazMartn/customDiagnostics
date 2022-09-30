const vscode = require('vscode');
module.exports = {
    pickAndApllyAfixSetName: async function () {
        pickAndApllyAfixSetName();
    },
    GetDiagnostics: function () {
        return GetDiagnostics();
    }
}

function pickAndApllyAfixSetName() {
    const getRuls = require('./getRules.js');    
    const fixSets = getRuls.getFixSets();
    let fixSetNames = [];
    if (!fixSets)
    {
        return;
    }
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
    const AppDiagnostics = GetDiagnostics();
    if (!AppDiagnostics)
    {
        return;
    }
    for (let i = 0; i < AppDiagnostics.length; i++) {
        let diagnostic = AppDiagnostics[i];
        let fix = fixes.find(fix => fix.code === diagnostic.code);
        if (fix) {
            await applyFixToDiagnostic(diagnostic, fix);
        }
    }    
}

async function applyFixToDiagnostic(diagnostic, fix) {
    if (diagnostic.code !== 'AL0223') {
        return;
    }
    let document = await vscode.workspace.openTextDocument(diagnostic.uri);    
    let edit = new vscode.WorkspaceEdit();
    let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line+1, 0);
    const RegEx = new RegExp(fix.searchExpresion, 'gi');
    const newLineText = document.lineAt(diagnostic.range.start.line).text.replace(RegEx,fix.replaceExpression);
    if (newLineText === document.lineAt(diagnostic.range.start.line).text) {
        return;
    }
    edit.replace(document.uri, range, newLineText);
    await vscode.workspace.applyEdit(edit);
}
function GetDiagnostics()
{
    const AppUri = vscode.workspace.workspaceFile;
    const AppDiagnostics = vscode.languages.getDiagnostics(AppUri);
    let Problems = [];
    if (!AppDiagnostics)
    {
        return[];
    }
    for (let i = 0; i < AppDiagnostics.length; i++) {
        for (let j = 0; j < AppDiagnostics[i][1].length; j++) {
          let Problem = AppDiagnostics[i][1][j];
          let ProblemRange = Problem.range;
            Problems.push(
                {
                  uri: AppDiagnostics[i][0].path,
                  range: ProblemRange,
                  code: Problem.code.value,
                  message: Problem.message,
                  severity: Problem.severity
                          })
        }
    }
  return Problems;
}
