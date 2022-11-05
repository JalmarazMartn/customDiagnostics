const vscode = require('vscode');
module.exports = {
    pickAndApllyAfixSetName: async function () {
        pickAndApllyAfixSetName();
    },
    GetDiagnostics: function () {
        return GetDiagnostics();
    },
    getNewText: function(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName)
    {
        return getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName)
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
    //if (diagnostic.code !== 'AL0223') {
    //    return;
    //}
    let document = await vscode.workspace.openTextDocument(diagnostic.uri);    
    let edit = new vscode.WorkspaceEdit();
    let range = new vscode.Range(diagnostic.range.start.line, 0, diagnostic.range.start.line, 
        document.lineAt(diagnostic.range.start.line).text.length);
    //const RegEx = new RegExp(fix.searchExpresion, 'gi');
    //const newLineText = document.lineAt(diagnostic.range.start.line).text.replace(RegEx,fix.replaceExpression);
    const newLineText = getNewText(document.lineAt(diagnostic.range.start.line).text, fix.searchExpresion, fix.replaceExpression,
    fix.jsModuleFilePath, fix.jsFunctionName);

    if (newLineText === document.lineAt(diagnostic.range.start.line).text) {
        return;
    }
    edit.replace(document.uri, range, newLineText);
    await vscode.workspace.applyEdit(edit);
}
function getNewText(originalText, searchExpresion, replaceExpression, jsModuleFilePath, jsFunctionName) {
    let existsReplaceExpr= replaceExpression!== undefined;
    let newText = originalText;
    const regex = new RegExp(searchExpresion, 'mgi');
    if (jsModuleFilePath) {        
        if (jsFunctionName) {
            try {
                var fn = new Function();
                const jsModule = require(jsModuleFilePath);
                fn = jsModule[jsFunctionName];
                newText = originalText.replace(regex,fn);
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
