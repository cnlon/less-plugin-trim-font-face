exports.ANY = '*'

exports.getValue = function getValue (value) {
    if (!value) {
        return value
    }
    if (value.value) {
        return getValue(value.value)
    }
    if (Array.isArray(value)) {
        return value.map(v => getValue(v)).join(' ')
    }
    return value
}
