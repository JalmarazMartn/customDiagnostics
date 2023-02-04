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

### 0.0.25

Error in diagnostics in all workspace: errors quit the output panel when you close the document.
