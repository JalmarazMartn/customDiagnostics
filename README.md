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
                "fileExtension": "al",
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

The properties of a replacing rule have the following meaning:

* "name": "Remove Scope Internal",`name of the replacing rule`
* "searchExpresion": "\\[Scope\\('Internal'\\)]",`pattern to search and replace in bulk replacement. This pattern can be a regular expression`
* "replaceExpression": "",`target string for substitution`


There is another powerful but complex way to set a replacing rule: instead of replaceExpression parameter, you can set a javascript function in a module. You can set the rule this way:

                "name": "Replace parameters in Create Reservation for",
                "searchExpresion": "[A-Za-z]+\\.CreateReservEntryFor\\(([^;]|\r|\n)*;",
                "jsModuleFilePath": "C:\\Users\\Jesus\\Documents\\Proyecto js\\customDiagnostics\\jsReplaceExampleModules\\replaceExample.js",
                "jsFunctionName": "CreateReservEntryFor"

instead of replaceExpression parameter, you can set a javascript function in a module. You can set the rule this way:

* "jsModuleFilePath": "C:\\Users\\Jesus\\Documents\\Proyecto js\\customDiagnostics\\jsReplaceExampleModules\\replaceExample.js",`path to the module file`
* "jsFunctionName": "CreateReservEntryFor",`name of the function that implemnets the replacing rule`


The example of the module is in the folder "jsReplaceExampleModules". For further information about how to make a function to replace a regular expression match, you can chech this link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace

For helping you to make rules and rulesets, you can use the following snippets:

* `tDiagnosticsFile`. Template for general scafolding of file.
* `tReplaceRule`. Template to write a replacing rule.
* `tReplaceWithFunctionRule`. Template to write a rule with a replacing function instead an string expression.
* `tReplaceRuleset`. Template to write a replacing  ruleset.
* `tDiagnostic`. Template to write a diagnostic rule.
* `tDiagnosticset`. Template to write a diagnostic ruleset.


**_With command "JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents" we can pick a ruleset from the list and replace all occurrences in all documents._**

![Replace image](https://github.com/JalmarazMartn/customDiagnostics/blob/main/images/bulkReplace.gif?raw=true)

### Fixes

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

**_Bellow you can configure a set of fixes and aplly them in all workspace documents with the command "JAM Fixes. Pick a fixset and apply fixes in all workspace documents diagnostics"._** Then you choose a fixset if you are more than one, and will apply all fixes in all documents.

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
        "diagnosticsets": [
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
* "skipFromSearchIfMatch":"",`optional property to set a pattern to exclude from diagnostic the match`
* "severity": "error",`severity of the diagnostic in problems panel: error, warning, information, hint`
* "language": "al"`language to apply the rule for replacing and diagnostic`

Note: You only will see custom diagnostics out of the document edition setting the extension parameter `JAMDiagnostics.ScanCustomDiagnosticsInAllWS` to true.

## Requirements

vscode
## Extension Settings

This extension contributes the following settings:

* `JAMRules.json`: Absolute path of rules json file name
* `JAMDiagnostics.DefaultDiagnosticRuleset`: Rulesets that will be used as diagnostics in problems Panel
* `JAMDiagnostics.AdditionalFilePaths`: Paths of aditional files to load rules and diagnostics.
* `JAMDiagnostics.ScanCustomDiagnosticsInAllWS`: Custom diagnostics for a doc are not enabled out of doc edition. If you want to keep seeing diagnostics outside the document edition you must set true this property. Is recommended to disable this property in big workspaces to avoid performance issues.

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

### 0.0.5

Fixing replace rules

### 0.0.6

fileExtension property in ruleset

### 0.0.7

Optimization and progress bar

### 0.0.8

Multi-line search and replacement

### 0.0.9

Apply fixes.

### 0.0.10

Showing fixes in quick fix.

### 0.0.11

Appliying javascript modules in replacements.

### 0.0.12

Fixing issues with replacing by empty string.

### 0.0.13

Activation events for language json.

### 0.0.14

Issue with search with negative clauses

### 0.0.15

Able to set one or more aditional rule files with settings property "JAMDiagnostics.AdditionalFilePaths". This setting will load as rules, diagnostics and fixes as you need been able to separate files to ease the configuration.

### 0.0.16

Error fixed:
Command 'JAM Custom Rules. Pick a ruleset and apply replacements in all workspace documents' resulted in an error (command 'JAMCustomRuls.replaceAllRulesInAllDocuments' not found)

### 0.0.17

Some errors in snippets, dianostics instead diagnostics. More control of diagnostics errors.

### 0.0.18

Only check diagnostics in configured language

### 0.0.19

Fix without traking

### 0.0.20

Apply bulk fixes.

### 0.0.21

Dependencies minimatch

### 0.0.22

Can use functions in fixes too, not only in replacements.

### 0.0.23

Check searchExpresion is filled.

### 0.0.24

New property in diagnostics skipFromSearchIfMatch. You can fill a regex in this property, to set an exclusion from the diagnostic. This way you can avoid complex negative clauses to set these exclusions.
