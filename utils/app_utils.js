export const AppUtils = {
    hasString(fullStr, checkStr) {
        if (fullStr === undefined) {
            return false
        }
        return fullStr.indexOf(checkStr) >= 0
    },

    isEmptyStr(s) {
        return s === null || s === undefined || s === '';
    },

    toadyTimestamp() {
        return new Date(new Date().toLocaleDateString()).getTime()
    }
}