const {ANY} = require('./common')
const TrimFontFace = require('./TrimFontFace')

module.exports = class LessPluginTrimFontFace {
    static get ANY () {
        return ANY
    }

    constructor (option) {
        this.option = option
    }

    install (less, pluginManager) {
        const trimmer = new TrimFontFace(this.option, less)
        pluginManager.addVisitor(trimmer)
    }
}
