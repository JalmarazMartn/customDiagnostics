# customdiagnostics README

Custom dainostics allows to define your own diagnostics to show then in problems panel. These diagnostics also can be used as bulk replacements rules.

## Features

You can configure a rule .json file to define your own diagnostics and replacements.

Then you set the file path in extension settings, in property "JAMDiagnosticsFile".

You can set rules and rulesets this way:


    {
        "rules": [
            {
                "code": "JAM0001",
                "message": "Avoid using transferfields",
                "searchExpresion": "(.+)\\.TransferFields\\((.+)\\)",
                "replaceExpression": "$1 := $2",
                "severity": "error",
                "language": "al"
            },
            {
                "code": "JAM0002",
                "message": "Remove Scope Internal",
                "searchExpresion": "\\[Scope\\('Internal'\\)]",
                "replaceExpression": "",
                "severity": "error",
                "language": "al"
            }
        ]
    },
    {
        "rulesets": [
            {
                "name": "Initial replacement rules from al",                
                "rules": [
                    "JAM0001",
                    "JAM0002"
                ]
            }
        ]
    }


With command "JAM Custom Rules. Change all rules in all documents" we can pick a ruleset from the list and replace all occurrences in all documents.

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/bulkReplace.gif?raw=true)
## Requirements

vscode
## Extension Settings

This extension contributes the following settings:

* `JAMRules.json`: Absolute path of rules json file name
* `JAMDiagnostics.DefaultDiagnosticRuleset`: Rulesets that will be used as diagnostics in problems Panel

## Known Issues


## Release Notes
### 1.0.0

The beta with replacement rules and diagnostics when you open the document.

Image creative common icon image from: https://uxwing.com/find-and-replace-icon/ 
