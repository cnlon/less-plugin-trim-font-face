const {ANY, getValue} = require('./common')

module.exports = class TrimFontFace {

    get isReplacing () {
        return true
    }

    get isPreEvalVisitor () {
        return true
    }

    /**
     * @param {string|Array|Object} option
     * @param {Object} less
     */

    constructor (option, less) {
        if (typeof option === 'string') {
            option = [option]
        }
        if (Array.isArray(option)) {
            option = {
                [ANY]: option
            }
        }
        this._option = {}
        for (let key of Object.keys(option)) {
            const formats = Array.isArray(option[key])
                ? option[key]
                : [option[key]]
            this._option[key] = new Set(formats)
        }

        this._visitor = new less.visitors.Visitor(this)

        this._inDirective = false
        this._inSrcRule = false
        this._fontRuleSet = null
    }

    run (root) {
        return this._visitor.visit(root)
    }

    visitDirective (directiveNode) {
        if (directiveNode.name === '@font-face') {
            this._inDirective = true
        }
        return directiveNode
    }

    visitDirectiveOut (directiveNode) {
        if (this._inDirective !== false) {
            this._inDirective = false

            const ruleNode = directiveNode.rules[0]
            ruleNode.rules = ruleNode.rules.filter(n => !n._toDelete)
        }
    }

    visitRule (ruleNode) {
        if (this._inDirective === true) {
            const {type, name, value} = ruleNode
            const nameString = getValue(name)
            if (nameString === 'font-family') {
                const family = getValue(value)
                const fontRuleSet = this._option[family]
                    || this._option[ANY]
                if (fontRuleSet) {
                    this._fontRuleSet = fontRuleSet
                }
            } else if (nameString === 'src') {
                this._inSrcRule = true
            }
        }
        return ruleNode
    }

    visitRuleOut (ruleNode) {
        if (this._inSrcRule !== false) {
            this._inSrcRule = false

            let toDelete = true
            let newValueArray = []
            for (const n of ruleNode.value.value) {
                if (n._toDelete) {
                    continue
                }
                if (n.type !== 'Comment') {
                    toDelete = false
                }
                newValueArray.push(n)
            }
            if (toDelete) {
                ruleNode._toDelete = true
            } else {
                ruleNode.value.value = newValueArray
            }
        }
    }

    visitExpression (expressionNode) {
        if (this._inSrcRule === true && this._fontRuleSet) {
            let url = ''
            let format = ''
            let isLocal = false
            for (const n of expressionNode.value) {
                if (n.type === 'Url') {
                    url = getValue(n.value)
                } else if (n.type === 'Call') {
                    if (n.name === 'format') {
                        format = getValue(n.args)
                    } else if (n.name === 'local') {
                        isLocal = true
                    }
                }
            }
            if (!this._fontRuleSet.has(format) && !isLocal) {
                expressionNode._toDelete = true
            }
        }
        return expressionNode
    }
}
