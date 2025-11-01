const vscode = require('vscode');
//Make Access to CodeActions  and Apply the codeaction

class JAMReplaceAndDiagnostics {
    async invoke(options, _token) {
        const params = options.input;
        switch (params.operation) {            
            case 'getReplaceRules': {
                const getRules = require('./getRules.js');
                const rules = getRules.getRules();
                let ToolResult = [];
                for (let i = 0; i < rules.length; i++) {
                    ToolResult.push(new vscode.LanguageModelTextPart(JSON.stringify(rules[i])));
                }
                return new vscode.LanguageModelToolResult(ToolResult);                
            }
            /*case 'getDiagnostics': {
                const getDiagnostics = require('./getRules.js');
                const diagnostics = await getDiagnostics.getDefaultDiagnostics();
                let ToolResult = [];
                for (let i = 0; i < diagnostics.length; i++) {
                    ToolResult.push(new vscode.LanguageModelTextPart(JSON.stringify(diagnostics[i].toString())));
                }
                return new vscode.LanguageModelToolResult(ToolResult);                
            }*/
            /*case 'getCodeActionsFromSelection': {
                const getCodeActions = require('./existingCodeActions.js');
                const codeActions = await getCodeActions.getCurrSelectionCodeActions();
                let ToolResult = [];
                for (let i = 0; i < codeActions.length; i++) {
                    ToolResult.push(new vscode.LanguageModelTextPart(JSON.stringify(codeActions[i])));
                }
                return new vscode.LanguageModelToolResult(ToolResult);                
            }*/
        }
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: 'Access to JAM Replace and Diagnostics Tool',
            confirmationMessages: {
                title: 'Get CodeActions, Rules, diagnostics and fixes',
                message: new vscode.MarkdownString('Do you want to search replace rule ocurrences in document?')
            }
        };
    }
}
function registerRulesAndDiagnostics(context) {
    context.subscriptions.push(
        vscode.lm.registerTool('replaces-and-diagnostics', new JAMReplaceAndDiagnostics())
    );
}

module.exports = {
    registerRulesAndDiagnostics: registerRulesAndDiagnostics
};
