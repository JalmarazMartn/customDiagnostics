module.exports = {
    replaceToUppercase: function (exprMatch) {
        return exprMatch.toUpperCase();
    },
    CreateReservEntryFor: function (exprMatch) {
        return CreateReservEntryFor(exprMatch);
    }
}
function CreateReservEntryFor(exprMatch) {
    const regex = new RegExp(/(,([^,]|\r|\n)*)/gmi);
    const CommaAndOthers = new RegExp(/;|,|\)|\r|\n|\s/gmi);
    const result = exprMatch.match(regex);
    let strFrom = "";
    let strTo = "";
    strFrom = strFrom + result[0] + result[1] + result[2] + result[3] + result[4] +
        result[5] + result[6] + result[7] + result[8] + result[9];
    strTo = strTo + result[0] + result[1] + result[2] + result[3] + result[4] + result[5] +
        result[6] + result[7] + ',ReservationEntry);';
    const trackingSetting = 'ReservationEntry."Serial No." := ' + result[8].replace(CommaAndOthers,'') + ';\r\n' +
        'ReservationEntry."Lot No." := ' + result[9].replace(CommaAndOthers,'') + ';\r\n';
    return  trackingSetting + exprMatch.replace(strFrom, strTo);

}