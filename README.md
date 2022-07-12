# customdiagnostics README

Custom diagnostics allows to define your own diagnostics to show them in problems panel. These diagnostics `also can be used as bulk replacements rules`. A set of rules can be applied with the command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents".

## Features

This extension provides a way to define a diagnostic and a replace rule in a file. Then you set the file path in extension settings, in property "JAMDiagnosticsFile".

You can set in this file with replacing rules and rulesets this way:

    {
        "rules": [
            {
                "name": "Avoid using transferfields",
                "searchExpresion": "(.+)\\.TransferFields\\((.+)\\)",
                "replaceExpression": "$1 := $2"
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
                "rules": [
                    "Avoid using transferfields",
                    "Remove Scope Internal"
                ]
            },
            {
                "name": "Empty rules to test",
                "rules": [
                    ""
                ]
            }
        ]



For helping you to make rules and rulesets, you can use the following snippets:

* `tDiagnosticsFile`. Template for general scafolding of file.
* `tReplaceRule`. Template to write a replacing rule.
* `tReplaceRuleset`. Template to write a replacing  ruleset.
* `tDiagnostic`. Template to write a diagnostic rule.
* `tDiagnosticset`. Template to write a diagnostic ruleset.


**_With command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents" we can pick a ruleset from the list and replace all occurrences in all documents._**

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/bulkReplace.gif?raw=true)

### Diagnostics

In the same file we set the replacing rules we can set a digsnotics to find and show in problems panel.

        "diagnostics": [
            {
                "code": "JAM0001",
                "message": "Avoid using transferfields",
                "searchExpresion": "(.+)\\.TransferFields\\((.+)\\)",
                "severity": "error",
                "language": "al"
            },
            {
                "code": "JAM0002",
                "message": "Remove Scope Internal",
                "searchExpresion": "\\[Scope\\('Internal'\\)]",
                "severity": "error",
                "language": "al"
            }
        ],
        "dianosticsets": [
            {
                "name": "Initial replacement rules from al",
                "diagnostics": [
                    "JAM0001",
                    "JAM0002"
                ]


The properties of a rule have the following meaning:

* "code": "JAM0002",`code of the diagnostic to show in problems panel`
* "message": "Remove Scope Internal",`message of the diagnostic to show in problems panel`
* "searchExpresion": "\\[Scope\\('Internal'\\)]",`pattern to search and replace in bulk replacement. This pattern can be a regular expression, and also can raise the diganostic in the problems panel`
* "severity": "error",`severity of the diagnostic in problems panel: error, warning, information, hint`
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
### 0.0.1

The beta with replacement rules and diagnostics when you open the document.

Image creative common icon image from: https://uxwing.com/find-and-replace-icon/ 

### 0.0.2

Change description of the extension.

### 0.0.3

Issue reading settings, can not execute replacing.

### 0.0.4

Separate replace rules and rulesets from diagnostics.