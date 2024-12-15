module.exports = {
    getExtensionDiagnostics: function () {
		return getExtensionDiagnostics();
	},
    addOwnExtensionRules: function (defaultDiagnosticRules) {
        return addOwnExtensionRules(defaultDiagnosticRules);
    }
}
function getExtensionDiagnostics()
{
    return[
        {
            "code": "JAMRULE0000",
            "message": "Multiline replacement will not be done. Add r-scaped before n-scaped this way: \\\\r\\\\n",
            "searchExpresion": "searchExpresion.*\\\\n",
            "skipFromSearchIfMatch": "\\\\r",
            "severity": "error",
            "language": "json",
        }
    ]
}
function addOwnExtensionRules(defaultDiagnosticRules) {
	const extensionDiagnostics = getExtensionDiagnostics();
	for (let index = 0; index < extensionDiagnostics.length; index++) {
		defaultDiagnosticRules.push(extensionDiagnostics[index]);
	}
	return (defaultDiagnosticRules);
}