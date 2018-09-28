const {ANY, getValue} = require('./common')

module.exports = class TrimFontFace {

    get isReplacing () {
        return true
    }

    get isPreEvalVisitor () {
        return true
    }

    /**
     * @param {Array|Object} option
     * @param {Object} less
     */

    constructor (option, less) {
        if (Array.isArray(option)) {
            option = {
                [ANY]: option
            }
        }
        this._option = {}
        for (const key of Object.keys(option)) {
            let value = option[key]
            if (Array.isArray(value)) {
                value = value.reduce((res, val) => {
                    res[val] = true
                    return res
                }, {})
            }
            this._option[key] = value
        }

        this._visitor = new less.visitors.Visitor(this)

        // Less renamed Directive -> AtRule & Rule -> Declaration from v3.0.0
        // https://github.com/less/less.js/blob/master/CHANGELOG.md#300
        this._inAtRule = false
        this._inSrcDeclaration = false
        this._fontFormatUrls = null
    }

    run (root) {
        return this._visitor.visit(root)
    }

    visitAtRule (atRuleNode) {
        if (atRuleNode.name === '@font-face') {
            this._inAtRule = true
        }
        return atRuleNode
    }

    visitDirective (directiveNode) {
        return this.visitAtRule(directiveNode)
    }

    visitAtRuleOut (atRuleNode) {
        if (this._inAtRule !== false) {
            this._inAtRule = false

            const declarationNode = atRuleNode.rules[0]
            declarationNode.rules = declarationNode.rules.filter(n => !n._toDelete)
        }
    }

    visitDirectiveOut (directiveNode) {
        return this.visitAtRuleOut(directiveNode)
    }

    visitDeclaration (declarationNode) {
        if (this._inAtRule === true) {
            const {name, value} = declarationNode
            const nameString = getValue(name)
            if (nameString === 'font-family') {
                const family = getValue(value)
                this._fontFormatUrls = this._option[family]
                    || this._option[ANY]
            } else if (nameString === 'src') {
                this._inSrcDeclaration = true
            }
        }
        return declarationNode
    }

    visitRule (ruleNode) {
        return this.visitDeclaration(ruleNode)
    }

    visitDeclarationOut (declarationNode) {
        if (this._inSrcDeclaration !== false) {
            this._inSrcDeclaration = false

            let toDelete = true
            let newValueArray = []
            for (const n of declarationNode.value.value) {
                if (n._toDelete) {
                    continue
                }
                if (n.type !== 'Comment') {
                    toDelete = false
                }
                newValueArray.push(n)
            }
            if (toDelete) {
                declarationNode._toDelete = true
            } else {
                declarationNode.value.value = newValueArray
            }
        }
    }

    visitRuleOut (ruleNode) {
        return this.visitDeclarationOut(ruleNode)
    }

    visitExpression (expressionNode) {
        if (this._inSrcDeclaration === true && this._fontFormatUrls) {
            let urlNode = null
            let format = ''
            let isLocal = false
            for (const n of expressionNode.value) {
                if (n.type === 'Call') {
                    if (n.name === 'format') {
                        format = getValue(n.args)
                    } else if (n.name === 'local') {
                        isLocal = true
                    }
                } else if (n.type === 'Url') {
                    urlNode = n
                }
            }
            const url = this._fontFormatUrls[format]
            if (url) {
                if (urlNode && typeof url === 'string') {
                    urlNode.value.value = url
                }
            } else if (!isLocal) {
                expressionNode._toDelete = true
            }
        }
        return expressionNode
    }
}
