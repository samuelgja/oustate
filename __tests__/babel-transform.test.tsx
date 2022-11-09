import stateTransformPlugin from '../packages/babel-transform/src'
import { transformSync } from '@babel/core'
import { format } from 'prettier'
describe('Babel Transform test', () => {
  it('should not transform basic code', () => {
    const code = `const a = 1`

    const expectedTransformedCode = `
    "use strict";
    
    var a = 1;
    `
    const { code: transformedCode } = transformSync(code, { plugins: [stateTransformPlugin] }) || {}

    if (!transformedCode) {
      throw new Error('No code transformed')
    }

    expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  })
  it('should not transform use hooks', () => {
    const code = `const a = useStateValue(user, () => null)`

    const expectedTransformedCode = `
    const a = useStateValue(user, () => null);
    `
    const { code: transformedCode } = transformSync(code, { plugins: [stateTransformPlugin], configFile: false }) || {}

    if (!transformedCode) {
      throw new Error('No code transformed')
    }

    expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  })
  // it('should  transform use hooks', () => {
  //   const code = `
  //   const app = () => {
  //     return <div>hello</div>;
  //   }`

  //   const expectedTransformedCode = `
  //   function _cC_1(p, n) {
  //     if (p?.hello !== n?.hello) {
  //       return false;
  //     }
  //     return true;
  //   }
  //   const app = () => {
  //     return <div>hello</div>;
  //   }

  //   `
  //   const { code: transformedCode } = transformSync(code, { plugins: [stateTransformPlugin], configFile: true }) || {}

  //   console.log(transformedCode)

  //   if (!transformedCode) {
  //     throw new Error('No code transformed')
  //   }

  //   expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  // })
})
