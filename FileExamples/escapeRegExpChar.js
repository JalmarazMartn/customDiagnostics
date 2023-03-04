module.exports = {
    escapeRegExpChars: function (exprMatch) {
        return getJSONNodeWithEscapedValue(exprMatch);
    }
}
function getJSONNodeWithEscapedValue(origExprMatch) {     
    let origJSONValue = '';
    origJSONValue = GetJSONValueGroup(origExprMatch);    
    let finalExpr = GetJSONKeyGroup(origExprMatch) + getEscapedRegex(origJSONValue); //`const data = JSON.parse(${JSON.stringify(origJSONValue)});`.toString();
    finalExpr = finalExpr + GetTrailCommaIfExists(origExprMatch);
    return finalExpr;
}
function GetJSONValueGroup(previousMatch = '') {
    const regexpJSONValueGroup = /".+"\s*:\s*"(.+)"/;
    const match = previousMatch.match(regexpJSONValueGroup);
    if (!match) {
        return '';
    }
    return match[1].toString();
}
function GetJSONKeyGroup(previousMatch = '') {
    const regexpJSONValueGroup = /(".+"\s*:\s*)".+"/;
    const match = previousMatch.match(regexpJSONValueGroup);
    if (!match) {
        return '';
    }
    return match[1].toString();
}
function GetTrailCommaIfExists(previousMatch = '') {
    const regexpJSONValueGroup = /.*(,)/;
    const match = previousMatch.match(regexpJSONValueGroup);
    if (!match) {
        return '';
    }
    return match[1].toString();
}
function getEscapedRegex(origJSONValue='')
{
    let escapedRegex = `const data = JSON.parse(${JSON.stringify(origJSONValue)});`.toString();
    escapedRegex = escapedRegex.replace('const data = JSON.parse(','');
    escapedRegex = escapedRegex.slice(0, -2);
    //finalExpr = finalExpr.replace("\\\\".toString(),"\\".toString());
    return escapedRegex.toString();
}