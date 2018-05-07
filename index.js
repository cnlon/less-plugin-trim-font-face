const {ANY} = require('./common')
const FontFaceTrimmer = require('./FontFaceTrimmer')

module.exports = class LessPluginTrimFontFace {
    static get ANY () {
        return ANY
    }

    constructor (option) {
        this.option = option
    }

    install (less, pluginManager) {
        const trimmer = new FontFaceTrimmer(this.option, less)
        pluginManager.addVisitor(trimmer)
    }
}
