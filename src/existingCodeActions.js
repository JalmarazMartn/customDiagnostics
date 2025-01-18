const vscode = require('vscode');
let ExecNumber = 0;
let HTMLContent = '';
module.exports = {
    getFixToClipboard: async function()
    {
        await getFixToClipboard();
    },
    ShowStepHTMLView: async function(context)
    {
        await ShowStepHTMLView(context);
    }
}
async function getCurrCodeActionsSelection(document, codeActions, SelectionRange) {    
    await vscode.window.withProgress({
        cancellable: true,
        location: vscode.ProgressLocation.Notification,
        title: 'Find CodeActions: ',
    }, async (progress) =>  {    
    for (let currLine = SelectionRange.start.line; currLine <= SelectionRange.end.line; currLine++){
        progress.report({ message: 'line ' + currLine.toString() + ' ' +  document.lineAt(currLine).text});
        await pushActionInRangeIfNotExists(currLine,document,codeActions,0,document.lineAt(currLine).firstNonWhitespaceCharacterIndex);
        const wordBeginnings = getAllWordBeginnings(document.lineAt(currLine).text);
        for (let index = 0; index < wordBeginnings.length; index++) {
            const wordBeginning = wordBeginnings[index];
            await pushActionInRangeIfNotExists(currLine,document,codeActions,wordBeginning,wordBeginning);
        }
        
        //await pushActionInRangeIfNotExists(currLine,document,codeActions,document.lineAt(currLine).firstNonWhitespaceCharacterIndex,document.lineAt(currLine).text.length);
    }
})
}
async function pushActionInRangeIfNotExists(currline, document, codeActions, firstPos, finalPos) {
    const range = new vscode.Range(new vscode.Position(currline, firstPos), new vscode.Position(currline, finalPos));
    const definition = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", document.uri, range);
    for (let index = 0; index < definition.length; index++) {
        const CodeAction = definition[index];
        pushCodeActionsIfNotExists(CodeAction, codeActions);
    }
}

function pushCodeActionsIfNotExists(codeActionStart, codeActions) {
    const existingCodeActions = codeActions.filter(x => x.title == codeActionStart.title);
    if (existingCodeActions) {
        if (existingCodeActions.length > 0) {
            return;
        }
    }
    codeActions.push(codeActionStart);
}
async function getFixToClipboard() {
    let fixWithCodeAction =
    {
        "name": "",
        "searchExpresion": "",
        "codeAction": await pickCodeAction()
    }
    //vscode.env.clipboard.writeText(JSON.stringify(fixWithCodeAction));

}
async function pickCodeAction() {
    const document = vscode.window.activeTextEditor.document;
    const selectionRange = vscode.window.activeTextEditor.selection;    
    let currCodeActions = [];
    await getCurrCodeActionsSelection(document,currCodeActions,selectionRange);
    if (!currCodeActions) {
        return {}
    }
    if (currCodeActions.length == 0) {
        return {}
    }
    let codeActionsTitles = [];
    for (let index = 0; index < currCodeActions.length; index++) {
        codeActionsTitles.push(currCodeActions[index].title);
    }
    const codeActionTitle = await vscode.window.showQuickPick(codeActionsTitles,
        { placeHolder: 'Choose CodeActions to execute.' });
    if (codeActionTitle == '') {
        return {};
    }
    const codeAction = currCodeActions.filter(x => x.title == codeActionTitle);        
    console.log(codeAction[0]);
    console.log(getElementFromJsonWithLevel(JSON.parse(JSON.stringify(codeAction[0])),'range'));
    console.log(getElementFromJsonWithLevel(JSON.parse(JSON.stringify(codeAction[0])),'line'));    
    return codeAction[0].title;
}
async function getCommandCodeActionFromTitle(codeActionTitle = '', diagnosticPosition, documentUri) {
    const document = vscode.window.activeTextEditor.document;
    let currCodeActions = [];
    const selectionRange = vscode.window.activeTextEditor.selection;    
    await getCurrCodeActionsSelection(document,currCodeActions,selectionRange);
    if (!currCodeActions) {
        return {}
    }
    if (currCodeActions.length == 0) {
        return {}
    }
    const codeAction = currCodeActions.filter(x => x.title == codeActionTitle);    
    return codeAction[0];
}
async function execCodeAction(codeActions) {
    if (codeActions[0].command) {
        let executionsWithArgs = 'vscode.commands.executeCommand(codeActions[0].command.command';
        if (codeActions[0].command.arguments) {
            for (let index = 0; index < codeActions[0].command.arguments.length; index++) {
                executionsWithArgs = executionsWithArgs + ',codeActions[0].command.arguments[' + index.toString() + ']';
            }
            executionsWithArgs = executionsWithArgs + ');';
        }
        await eval(executionsWithArgs);
        return;
    }
    if (codeActions[0].edit) {
        await applyEditFromCodeActions(codeActions);
    }
}
async function applyEditFromCodeActions(codeActions) {    
    /*for (let index = 0; index < codeActions.length; index++) {
        const element = codeActions[index];
            console.log(element.edit.c[0].edit);
            console.log(element.edit.c[1].edit);
            console.log(element.edit.c[0].edit.newText);
            console.log(element.edit.c[1].edit.newText);
    }*/
    await vscode.workspace.applyEdit(codeActions[0].edit);
}

async function applyCodeAction(diagnostic, fix, document) {    
    const codeAction = await getCommandCodeActionFromTitle(fix.codeAction, diagnostic.start, document.uri);
    if (!codeAction) {
        return false;
    }
    await execCodeAction(codeAction);
    return true;
}
function getElementFromJson(jsonObj, elementName) {    
    for (let key in jsonObj) {
        if (key === elementName) {
            return jsonObj[key];
        }
        if (['object', 'function', 'oo'].includes(typeof jsonObj[key]) && jsonObj[key] !== null) {
            let result = getElementFromJson(jsonObj[key], elementName);
            if (result) {
                return result;
            }
        }
    }
    /*if (Array.isArray(jsonObj)) {
        for (let item of jsonObj) {
            if (['object', 'function', 'oo'].includes(typeof item) && item !== null) {
                let result = getElementFromJson(item, elementName);
                if (result) {
                    return result;
                }
            }
        }
    }*/
    return null; // Element not found
}
function getElementFromJsonWithLevel(jsonObj, elementName) {
    let level = 0;
    function searchElement(obj, name, currentLevel) {
        for (let key in obj) {
            if (key === name) {
                return { value: obj[key], level: currentLevel };
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                let result = searchElement(obj[key], name, currentLevel + 1);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    return searchElement(jsonObj, elementName, level +1);
}
function getAllWordBeginnings(text) {
    const wordBeginnings = [];
    const regex = /\b\w/g; // Matches the beginning of each word
    let match;
  
    while ((match = regex.exec(text))) {
      wordBeginnings.push(match.index);
    }
  
    return wordBeginnings;
  }
  async function ShowStepHTMLView(context) {
    HTMLContent = await GetHTMLContent(context);
    const WebviewSteps = vscode.window.createWebviewPanel(
      'Code Actions discoverer',
      'Code Actions discoverer',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );    
    
    WebviewSteps.webview.onDidReceiveMessage(
      async function (message) {
        console.log(message);
        ExecNumber = ExecNumber + 1;
        WebviewSteps.webview.html = HTMLContent + ExecNumber.toString();
        /*const IsSkipMessageCommand = message.command.indexOf('Skip') > -1;
        const IsNextMessageCommand = message.command.indexOf('Next') > -1;
        const IsPickScriptStepToExecuteMessageCommand = message.command.indexOf('PickScriptStepToExecute') > -1;
        CurrentStep = CurrentStep + 1;
        if (CurrentStep >= scriptsSteps.vsCodeSteps.length) {
          WebviewSteps.dispose();
          return;
        }
        if (IsSkipMessageCommand) {
          const ConfirmationSkipMessage = 'Do you want to skip step"' + GetCurrentDescription(CurrentStep) + '"?';
          //if (vscode.window.showInformationMessage(ConfirmationSkipMessage,{modal:true}, 'Yes', 'No') == 'No') {
          if (GetConfirmRequired()) {
            vscode.window.showInformationMessage(ConfirmationSkipMessage, { modal: true }, 'Yes', 'No').then(
              (resolve) => {
                if (resolve == 'No') {
                  CurrentStep = CurrentStep - 1;
                }
                WebviewSteps.webview.html = GetHTMLContent(GetCurrentDescription(CurrentStep), GetCurrentDescription(CurrentStep + 1), context);
              });
          }
        } else if (IsNextMessageCommand) {
          ExecuteCurrentStep();
        }
        else if (IsPickScriptStepToExecuteMessageCommand) {
          //PickScriptStepToExecute();
          //CurrentStep = CurrentStep - 1;
          //WebviewSteps.dispose();
          CurrentStep = await PickStepNumber() - 1;
        }
        WebviewSteps.webview.html = GetHTMLContent(GetCurrentDescription(CurrentStep), GetCurrentDescription(CurrentStep + 1), context);
      */},
      undefined,
      context.subscriptions
    );    
    ExecNumber = 0;
    WebviewSteps.webview.html = HTMLContent;
  }
  async function GetHTMLContent(context) {
    const path = require('path');
    const fs = require('fs');
    const filePath = context.asAbsolutePath(path.join('src', 'html', 'codeActions.html'));
    let FinalTable = fs.readFileSync(filePath, 'utf8');
    FinalTable = FinalTable.replace('<option value="CodeActionTitle">CodeActionTitle</option>', await getCodeactionTitlesAsHtmlOptions());
    return FinalTable;
  }
  async function getCodeactionTitlesAsHtmlOptions()
  {
    const document = vscode.window.activeTextEditor.document;
    const selectionRange = vscode.window.activeTextEditor.selection;    
    let OptionsSelection = ''
    let currCodeActions = [];    
    await getCurrCodeActionsSelection(document,currCodeActions,selectionRange);
    if (!currCodeActions) {
        return ''
    }
    if (currCodeActions.length == 0) {
        return ''
    }
    for (let index = 0; index < currCodeActions.length; index++) {
        OptionsSelection = OptionsSelection + '<option value="' + currCodeActions[index].title + '">' + currCodeActions[index].title + '</option>';
    }
    return OptionsSelection;
  }
