# Change Log

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

### 0.0.25 26 27

Error in diagnostics in all workspace: errors quit the output panel when you close the document.

### 0.0.28

Apply ruleset in current document. Check rule and ruleset edition. Pick a rule editing ruleset.

### 0.0.29

Check diagnostic and fix set edition. Pick a diagnostic or fix editing sets.

### 0.0.30

Regex Help

### 0.0.31

Error when appply fix to our own diagnostics

### 0.0.32

Apply ruleset in current document selection.

### 0.0.33

Disable commands when must not be used. In document replacement get only rule sets for current file extension.

### 0.0.34

Additional conditions in diagnostics. An object array property in diagnostic called "andFileAlsoMustInclude", can contain a "searchExpresion". For diagnostic raising  all this searchExpression must be matched in file.

### 0.0.35

Additional setup in rule sets: saveAfterApply. If settled is true, changed documents will be saved and closed.

### 0.0.36

Error erratic behaviour, only replace one rule for document.

### 0.0.37

Scope property for replace rule set.

### 0.0.38

New property in diagnostics: "skipIfFileInclude": object array of searchExpresion that skip diagnostic if match in any place of the file.

### 0.0.39

Apply fix with command instead edit (internal change)

### 0.0.40

New command "JAM Fixes. Pick a fixset and apply fixes in current document diagnostics".

### 0.0.41

Changes in apply fix behaviour: you can set in fix code an empty string to apply it in any diagnostic code. But in this case the search expression must also match in the diagnostic message.


### 0.0.42

Same changes as release 41 above for the fix action suggestion feature.

### 0.0.43

Raise error on invalid regular expression.

### 0.0.44

Check invalid regex when editting. Completion item without labels

### 0.0.45

Avoid diagnostics raising in preview non-editable files.

### 0.0.46

Define a js function to check diagnostincs conditions

### 0.0.47

More precision in fix replacing