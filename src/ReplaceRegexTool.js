const vscode = require('vscode');

class ReplaceRegexTool {
    async invoke(options, _token) {
        const text = await vscode.env.clipboard.readText();
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`El contenido actual del portapapeles es:\n${text}`)
        ]);
    }

    async prepareInvocation(options, _token) {
        return {
            invocationMessage: 'Search replace rule ocurrences in document',
            confirmationMessages: {
                title: 'Search replace rule ocurrences in document',
                message: new vscode.MarkdownString('Do you want to search replace rule ocurrences in document?')
            }
        };
    }
}
function registerReplaceRegexTool(context) {
    context.subscriptions.push(
        vscode.lm.registerTool('regex-replace-rule', new ReplaceRegexTool())
    );
}

module.exports = {
    registerReplaceRegexTool
};
