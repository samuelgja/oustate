import { PluginItem, parseSync } from '@babel/core'
import { transformHook } from './transform'
/**
 * oustate transform plugin
 */
const oustateBabelTransformPlugin = (): PluginItem => {
  const outputTransforms: Record<string, true> = {}
  return {
    name: 'oustate-babel-transform',
    pre(file) {
      transformHook(file.ast, outputTransforms)
    },
    post(file) {
      for (const prop in outputTransforms) {
        const program = parseSync(prop)
        if (program?.program.body) {
          file.ast.program.body = [...program.program.body, ...file.ast.program.body]
        }
      }
      return
    },
  }
}

export default oustateBabelTransformPlugin
