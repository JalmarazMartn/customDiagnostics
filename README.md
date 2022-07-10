# customdiagnostics README

Custom diagnostics allows to define your own diagnostics to show them in problems panel. These diagnostics `also can be used as bulk replacements rules`. A set of rules can be applied with the command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents".

## Features

This extension provides a way to define a diagnostic and a replace rule in a file. Then you set the file path in extension settings, in property "JAMDiagnosticsFile".

You can make a file with rules and rulesets this way:

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

For helping you to make rules and rulesets, you can use the following snippets:

* `tDiagnosticsFile`. Template for general scafolding of file.
* `tDiagnosticsRule`. Template to write a rule.
* `tDiagnosticsRuleset`. Template to write a ruleset.

With command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents" we can pick a ruleset from the list and replace all occurrences in all documents.

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/bulkReplace.gif?raw=true)

### Rules

The properties of a rule have the following meaning:

* "code": "JAM0002",`code of the diagnostic to show in problems panel`
* "message": "Remove Scope Internal",`message of the diagnostic to show in problems panel`
* "searchExpresion": "\\[Scope\\('Internal'\\)]",`pattern to search and replace in bulk replacement. This pattern can a regular expression, and also can raise the diganostic in the problems panel`
* "replaceExpression": "",`replace expression to substitute the previous pattern`
* "severity": "error",`severity of the diagnostic in problems panel`
* "language": "al"`language to apply the rule for replacing and diagnostic`

## Requirements

vscode
## Extension Settings

This extension contributes the following settings:

* `JAMRules.json`: Absolute path of rules json file name
* `JAMDiagnostics.DefaultDiagnosticRuleset`: Rulesets that will be used as diagnostics in problems Panel

## Known Issues

Only shows custom diagnostics in problems panel, if you open the text document in your editor. I am thinking to do or not other way due performanece issues. So not sure this will be an issue or not.

## Release Notes
### 1.0.0

The beta with replacement rules and diagnostics when you open the document.

Image creative common icon image from: https://uxwing.com/find-and-replace-icon/ 
