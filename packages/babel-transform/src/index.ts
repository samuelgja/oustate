import { PluginItem, parseSync } from '@babel/core'
import { extractObjectPattern } from './extract-object-array-pattern'
import { arrayToRecord, getId } from './utils'

const hooks = ['useStateValue', 'useLoadableStateValue', 'useCachedStateValue']
const hooksRecord = arrayToRecord(hooks)

/**
 * oustate transform plugin
 */
const oustateBabelTransformPlugin = (): PluginItem => {
  const outputTransforms: Record<string, true> = {}
  return {
    name: 'oustate-babel-transform',
    post(file) {
      for (const prop in outputTransforms) {
        const program = parseSync(prop)
        if (program?.program.body) {
          file.ast.program.body = [...program.program.body, ...file.ast.program.body]
        }
      }
      return
    },

    visitor: {
      VariableDeclarator({ node }) {
        if (node.init?.type !== 'CallExpression') {
          return
        }
        const callee = node.init.callee
        if (!(callee.type === 'Identifier' && hooksRecord[callee.name])) {
          return
        }

        if (!(node.id.type === 'ObjectPattern' || node.id.type === 'ArrayPattern')) {
          return
        }

        if (node.init.arguments.length === 0) {
          return
        }

        if (node.init.arguments.length === 3) {
          return
        }

        const objectPatternProps = extractObjectPattern(node.id)
        if (objectPatternProps.length === 0) {
          return
        }

        // add second argument if not exists
        if (!node.init.arguments[1]) {
          node.init.arguments.push({
            type: 'Identifier',
            name: 'undefined',
          })
        }

        const variableName = `_cC_${getId()}`
        // add third argument
        node.init.arguments.push({
          type: 'Identifier',
          name: variableName,
        })

        let output = `function ${variableName}(p, n) {`

        for (const value of objectPatternProps.reverse()) {
          const condition = value.join('?.')
          output += `if (p?.${condition} !== n?.${condition}) {
            return false
          }\n`
        }
        output += 'return true\n}'
        outputTransforms[output] = true
      },
    },
  }
}

export default oustateBabelTransformPlugin
