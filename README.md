# customdiagnostics README
Main features:
* Replacements: You can avoid type the same replacement over and over, saving them in setting files, and applying them grouping in sets.
* Diagnostics: You can set customized errors, warnings and messages, to show them in the Problems Panel.
* Fixes: Combination of both previous features. You can fix diagnostics (customized or existing ones) by replacing rules.

Custom diagnostics allows to define your own diagnostics to show them in problems panel. These diagnostics `also can be used as bulk replacements rules`. A set of rules can be applied with the command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents".
Posts about extension.
https://community.dynamics.com/business/b/jesusalmarazblog/posts/new-bulk-replacing-vscode-extension

https://community.dynamics.com/business/b/jesusalmarazblog/posts/how-to-set-your-own-vscode-diagnostics-replacing-tool-2

## Features

This extension provides a way to define a diagnostic and a replace rule in a file. Then you set the file path in extension settings, in property "JAMDiagnosticsFile".

You can set in this file with replacing rules and rulesets this way:

    {
        "rules": [
            {
                "name": "Avoid using transferfields",
                "searchExpresion": "(.+)\\.TransferFields\\((.+)\\)",
                "replaceExpression": "$1 := $2",
                "numberOfRepetitions": 3
            },
            {
                "name": "Remove Scope Internal",
                "searchExpresion": "\\[Scope\\('Internal'\\)]",
                "replaceExpression": ""
            }
        ],
        "rulesets": [
            {
                "name": "Initial replacement rules from al",
                "fileExtension": "al",
                "rules": [
                    "Avoid using transferfields",
                    "Remove Scope Internal"
                ],
                "saveAfterApply":true,
                "scope":["workspace","document","selection"]
            },
            {
                "name": "Empty rules to test",
                "rules": [
                    ""
                ]
            }
        ]

The properties of a replacing rule have the following meaning:

* "name": "Remove Scope Internal",`name of the replacing rule`
* "searchExpresion": "\\[Scope\\('Internal'\\)]",`pattern to search and replace in bulk replacement. This pattern can be a regular expression`
* "replaceExpression": "",`target string for substitution`
* "numberOfRepetitions": 1 `sometimes a rule needs to be applied more then once. Optional setting, for doing more iterations wih the rule`
* "regexOptions": gmi `This property sets flags of regex search. If not settled, the default is gmi. More info https://javascript.info/regexp-introduction`

There is another powerful but complex way to set a replacing rule: instead of replaceExpression parameter, you can set a javascript function in a module. You can set the rule this way:

                "name": "Replace parameters in Create Reservation for",
                "searchExpresion": "[A-Za-z]+\\.CreateReservEntryFor\\(([^;]|\r|\n)*;",
                "jsModuleFilePath": "C:\\Users\\Jesus\\Documents\\Proyecto js\\customDiagnostics\\jsReplaceExampleModules\\replaceExample.js",
                "jsFunctionName": "CreateReservEntryFor"

instead of replaceExpression parameter, you can set a javascript function in a module. You can set the rule this way:

* "jsModuleFilePath": "C:\\Users\\Jesus\\Documents\\Proyecto js\\customDiagnostics\\jsReplaceExampleModules\\replaceExample.js",`path to the module file`
* "jsFunctionName": "CreateReservEntryFor",`name of the function that implemnets the replacing rule`


The example of the module is in the folder "jsReplaceExampleModules". For further information about how to make a function to replace a regular expression match, you can chech this link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace

Replace rule set properties are:
* Name. No further remarks needed.
* fileExtension. This property set where this rule set is applicable.
* rules. Array of rules of the rule set.
* saveAfterApply. Not mandatory. Set true if you want to save all documents that the rule set application modified.
* scope. Not mandatory. When this rule set is available, depending on the command invoked.

Possible values for scope are (empty or not settled=all):
* workspace. Replace rule set is enabled for command: "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents"
* document. Enable for command: "JAM Custom Rules. Pick a ruleset and apply replacements in the current document"
* selection. Enable for command: "JAM Custom Rules. Pick a ruleset and apply replacements in current selection"

For helping you to make rules and rulesets, you can use the following snippets:

* `tDiagnosticsFile`. Template for general scafolding of file.
* `tReplaceRule`. Template to write a replacing rule.
* `tReplaceWithFunctionRule`. Template to write a rule with a replacing function instead an string expression.
* `tReplaceRuleset`. Template to write a replacing  ruleset.
* `tDiagnostic`. Template to write a diagnostic rule.
* `tDiagnosticset`. Template to write a diagnostic ruleset.


**_With command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents" we can pick a ruleset from the list and replace all occurrences in all documents._**

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/bulkReplace.gif?raw=true)

**_If you only want to apply replace in current document you can execute command "JAM Custom Rules. Pick a ruleset and apply replacements in current document"_**

**_And last: If you only want to apply replace in current document selection you can execute command "JAM Custom Rules. Pick a ruleset and apply replacements in current selection"_**

To help ruleset editting will raise an error with the rules not defined included in ruleset. To select existing an rule to include it in a ruleset you can use this completion item (with control+Space):

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/getRuleCompletion.gif?raw=true)

Note release 27: We add these helps to diagnostic and fix sets edition, selection an no extisting error.

### Fixes

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/CustomFix.gif?raw=true)

Fixes is a subtle way to do replacements. The replacement will be done only if the line has a problem, with an error code. You can set a fix this way:

        "fixes": [
            {
                "name":"Remove unnecesary decimals places",
                "code": "AL0223",
                "searchExpresion": ".*DecimalPlaces.*",
                "replaceExpression": ""
            }
        ],
        "fixsets": [
            {
                "name": "Set of basics fixes of al",
                "fixes": [
                    "Remove unnecesary decimals places"
                ]
            }
        ]
The meaning: the replacing will be applied only if the line has a problem with code "AL0223", in problems panel.

**_You can set in fix code an empty string to apply it in any diagnostic code. But in this case the search expression must also match in the diagnostic message._**

**_Bellow you can configure a set of fixes and aplly them in all workspace documents with the command "JAM Fixes. Pick a fixset and apply fixes in all workspace documents diagnostics"._** Then you choose a fixset if you are more than one, and will apply all fixes in all documents.

**_You can apply fixes in a more restricted mode with command:"JAM Fixes. Pick a fixset and apply fixes in current document diagnostics"._**

### Command: Build a fix from current diagnostic and copy it in clipboard

This command features the partial creation of a fix and his store in clipboard to past it in a .json rules file. The steps to use it are:

- Place the cursor in the editor, in a text that raise a diagnostic bellow in the diagnostic panel.
- Execute in command palette: **_"JAM Custom Rules. Build a fix from current diagnostic and copy it in clipboard"_**. Then, you will get in your clipboard a new fix definition, with the diagnostic code, name, and searchexpression.
- Edit your rules json file, and paste the fix.
- Edit **_replaceexpression_** in the fix.
- If needed include this fix in a fixset.

### Diagnostics

In the same file we set the replacing rules we can set a digsnotics to find and show in problems panel.

        "diagnostics": [
                {
                    "code": "JAMMIG001",
                    "message": "Review SQlDateType Variant",
                    "searchExpresion": "SQLDataType.*Variant",
                    "severity": "error",
                    "language": "al"
                },
                {
                    "code": "JAMMIG002",
                    "message": "Review layout path",
                    "searchExpresion": "RDLCLayout = '",
                    "skipFromSearchIfMatch": "/Layout/",
                    "severity": "error",
                    "language": "al",
                    "andFileAlsoMustInclude":
                    [
                        {
                            "searchExpresion": "report\\s+\\d*\\s+.+"
                        }
                    ],
                    "skipIfFileInclude":
                    [
                        {
                            "searchExpresion": "ProcessOnly"
                        }
                    ]                    
                }
                        ],
        "diagnosticsets": [
            {
                "name": "Cloud Migration Errors",
                "diagnostics": [
                    "JAMMIG001",
                    "JAMMIG002"
                ]


The properties of a rule have the following meaning:

* "code": "JAMMIG002",`code of the diagnostic to show in problems panel`
* "message": "Review layout path",`message of the diagnostic to show in problems panel`
* "searchExpresion": "RDLCLayout = '",`pattern to search and replace in bulk replacement. This pattern can be a regular expression, and also can raise the diganostic in the problems panel`
* "skipFromSearchIfMatch":"/Layout/",`optional property to set a pattern to exclude from diagnostic the match`
* "severity": "error",`severity of the diagnostic in problems panel: error, warning, information, hint`
* "language": "al"`language to apply the rule for replacing and diagnostic`
* "andFileAlsoMustInclude":`object array of searchExpresion that must be satisfied to raise the diagnostic`
* "skipIfFileInclude": `object array of searchExpresion that skip diagnostic if match in any place of the file`
* "regexOptions": gmi `This property sets flags of regex search. If not settled, the default is gmi. More info https://javascript.info/regexp-introduction`

Note: You only will see custom diagnostics out of the document edition setting the extension parameter `JAMDiagnostics.ScanCustomDiagnosticsInAllWS` to true.

You also can define a Javascript function to do more complex and customized diagnostic checkings:

        {
            "code": "JAMMIG022",            
            "message": "Campo no declarado en el layout",            
            "searchExpresion": "Fields!.+.Value",
            "severity": "error",
            "language": "xml",
            "jsModuleFilePath": "C:\\Users\\Jesus\\Documents\\Proyecto js\\customDiagnostics\\FileExamples\\ComplexReplaces.js",
            "jsFunctionName": "existsFieldDeclaration"
        }

Js module must include a function with this signature: `function existsFieldDeclaration(fieldLine='')` and return true if diagnostic matches. You can see example in this repo file: https://github.com/JalmarazMartn/customDiagnostics/blob/main/FileExamples/ComplexReplaces.js 

#### Steps to set the diagnostics
- Open json settings.
- Set all diagnostics you can need.
- Create diagnostic sets in json, with diagnostics created in the previous step.
- In extension settings configure this diagnostic set in `JAMDiagnostics.DefaultDiagnosticRuleset`.

### Regex Help

It was hard to write new regular expressions and write them escaped in a JSON value. To ease this work you can edit regular expressions this way, using specific context menu:

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/regexHelp.gif?raw=true)

### CodeActions dicoverer

With action "JAM CodeActions Discoverer" command help you to discover all code actions available in the current selection document. You can see all code actions available in the current document, and apply them pusshing the button "Execute":

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/CodeActiosnDiscoverer.gif.gif?raw=true)

Steps:

- Select a text in the editor.
- Execute command "JAM CodeActions Discoverer".
- Then you will see all available code actions in the current selection in a desplegable list.
- Choose the code action you want to apply. You can apply once for all document or workspace actions, or apply multiple times in the document, in occurences of the selection that contains the code action and match with the search expression. Also you can test the regex with an example.
- Push the button "Execute" to apply the code action.

## Requirements

vscode
## Extension Settings

This extension contributes the following settings:

* `JAMRules.json`: Absolute path of rules json file name
* `JAMDiagnostics.DefaultDiagnosticRuleset`: Rulesets that will be used as diagnostics in problems Panel
* `JAMDiagnostics.AdditionalFilePaths`: Paths of aditional files to load rules and diagnostics.
* `JAMDiagnostics.ScanCustomDiagnosticsInAllWS`: Custom diagnostics for a doc are not enabled out of doc edition. If you want to keep seeing diagnostics outside the document edition you must set true this property. Is recommended to disable this property in big workspaces to avoid performance issues.
* `JAMDiagnostics.RegexpHelpURL`: URL to open in the context menu action "JAM Custom Rules. Open regex help URL in explorer".
* `JAMDiagnostics.EnableHelpContextMenus`: Option to enable extension context menus.


## Known Issues

Only shows custom diagnostics in problems panel, if you open the text document in your editor. I am thinking to do or not other way due performanece issues. So not sure this will be an issue or not.

## Release Notes
