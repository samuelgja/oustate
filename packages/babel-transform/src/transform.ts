import { Node } from '@babel/core'
import traverse from '@babel/traverse'
import { extractObjectPattern } from './extract-object-array-pattern'
import { arrayToRecord, getId } from './utils'
const hooks = ['useStateValue', 'useLoadableStateValue', 'useCachedStateValue']
const hooksRecord = arrayToRecord(hooks)
const importName = 'oustate'

/**
 * Transform oustate hooks to shallow compare automatically - but without some optimizations
 */
export const transformHook = (ast: Node, outputTransforms: Record<string, true> = {}) => {
  const hooksRecordLocal: Record<string, boolean> = {}
  let hasIt = false
  traverse(ast, {
    ImportDeclaration(path) {
      const { node } = path
      if (node.source.value !== importName) {
        return
      }

      const specifiers = node.specifiers
      if (specifiers.length === 0) {
        return
      }

      const hasHook = specifiers.some((specifier) => {
        if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
          hooksRecordLocal[specifier.local.name ?? specifier.imported.name] = true
          return hooksRecord[specifier.imported.name]
        }
        return false
      })

      if (hasHook) {
        hasIt = true
      }
    },
    VariableDeclarator(path) {
      const { node } = path
      if (!hasIt) {
        return
      }
      if (node.type !== 'VariableDeclarator') {
        return
      }
      if (node.init?.type !== 'CallExpression') {
        return
      }
      const callee = node.init.callee
      if (!(callee.type === 'Identifier' && hooksRecordLocal[callee.name])) {
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
  })
  return outputTransforms
}
