import { ArrayPattern, ObjectPattern } from '@babel/types'

/**
 * Extracting parameters from object or array pattern
 */
export const extractObjectPattern = (node: ArrayPattern | ObjectPattern, parent: string[] = [], result: string[][] = []) => {
  switch (node.type) {
    case 'ArrayPattern':
      if (node.elements.length > 0) {
        for (let index = 0; index < node.elements.length; index++) {
          const element = node.elements[index]

          if (element?.type === 'Identifier') {
            result.push([...parent, `[${index}]`])
          } else if (element?.type === 'ObjectPattern' || element?.type === 'ArrayPattern') {
            extractObjectPattern(element, parent, result)
          }
        }
      }
      break
    case 'ObjectPattern':
      for (const property of node.properties) {
        if (property.type === 'ObjectProperty') {
          if (property.value.type === 'Identifier' && property.key.type === 'Identifier') {
            result.push([...parent, property.key.name])
          }
          if (
            (property.value.type === 'ObjectPattern' || property.value.type === 'ArrayPattern') &&
            property.key.type === 'Identifier'
          ) {
            extractObjectPattern(property.value, [...parent, property.key.name], result)
          }
        }
      }
  }

  return result
}
