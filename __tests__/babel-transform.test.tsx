import stateTransformPlugin from '../packages/babel-transform/src'
import { transformSync } from '@babel/core'
import { format } from 'prettier'

jest.mock('../packages/babel-transform/src/utils', () => {
  const originalModule = jest.requireActual('../packages/babel-transform/src/utils')
  return { ...originalModule, getId: () => 'test' }
})

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
  it('should transform use hooks', () => {
    const code = `
    import {useStateValue} from 'oustate'
    const {state} = useStateValue(abc)
    const app = () => {
      return <div>hello</div>;
    }`

    const expectedTransformedCode = `
    "use strict";

    function _cC_test(p, n) {
      if (p?.state !== n?.state) {
        return false;
      }
      return true;
    }
    var _oustate = require("oustate");
    var _useStateValue = (0, _oustate.useStateValue)(abc, undefined, _cC_test),
      state = _useStateValue.state;
    var app = function app() {
      return /*#__PURE__*/React.createElement("div", null, "hello");
    };
    `
    const { code: transformedCode } = transformSync(code, { plugins: [stateTransformPlugin], configFile: true }) || {}

    if (!transformedCode) {
      throw new Error('No code transformed')
    }

    expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  })

  it('should transform use hooks', () => {
    const code = `
    import {useStateValue as someLocalName} from 'oustate'
    const {state} = someLocalName(abc)
    const app = () => {
      return <div>hello</div>;
    }`

    const expectedTransformedCode = `
    "use strict";

    function _cC_test(p, n) {
      if (p?.state !== n?.state) {
        return false;
      }
      return true;
    }
    var _oustate = require("oustate");
    var _someLocalName = (0, _oustate.useStateValue)(abc, undefined, _cC_test),
      state = _someLocalName.state;
    var app = function app() {
      return /*#__PURE__*/React.createElement("div", null, "hello");
    };

    `
    const { code: transformedCode } = transformSync(code, { plugins: [stateTransformPlugin], configFile: true }) || {}

    if (!transformedCode) {
      throw new Error('No code transformed')
    }

    expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  })

  it('should transform use hooks', () => {
    const code = `

    import {useStateValue} from 'oustate'
    const {state:{stateX:[a,b,c,d,e,f]}} = useStateValue(abc)
    `

    const expectedTransformedCode = `
    function _cC_test(p, n) {
      if (p?.state?.stateX?.[5] !== n?.state?.stateX?.[5]) {
        return false;
      }
      if (p?.state?.stateX?.[4] !== n?.state?.stateX?.[4]) {
        return false;
      }
      if (p?.state?.stateX?.[3] !== n?.state?.stateX?.[3]) {
        return false;
      }
      if (p?.state?.stateX?.[2] !== n?.state?.stateX?.[2]) {
        return false;
      }
      if (p?.state?.stateX?.[1] !== n?.state?.stateX?.[1]) {
        return false;
      }
      if (p?.state?.stateX?.[0] !== n?.state?.stateX?.[0]) {
        return false;
      }
      return true;
    }
    function _cC_test(p, n) {
      if (p?.state !== n?.state) {
        return false;
      }
      return true;
    }
    import { useStateValue } from 'oustate';
    const {
      state: {
        stateX: [a, b, c, d, e, f]
      }
    } = useStateValue(abc, undefined, _cC_test);
    `
    const { code: transformedCode } = transformSync(code, { plugins: [stateTransformPlugin], configFile: false }) || {}
    if (!transformedCode) {
      throw new Error('No code transformed')
    }

    expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  })
  it('should transform use hooks with react-native metro babel preset', () => {
    const code = `

    import {useStateValue} from 'oustate'
    const {hello} = useStateValue(abc)
    `

    const expectedTransformedCode = ` 
    function _cC_test(p,n){if(p?.hello!==n?.hello){return false;}return true;}function _cC_test(p,n){if(p?.state?.stateX?.[5]!==n?.state?.stateX?.[5]){return false;}if(p?.state?.stateX?.[4]!==n?.state?.stateX?.[4]){return false;}if(p?.state?.stateX?.[3]!==n?.state?.stateX?.[3]){return false;}if(p?.state?.stateX?.[2]!==n?.state?.stateX?.[2]){return false;}if(p?.state?.stateX?.[1]!==n?.state?.stateX?.[1]){return false;}if(p?.state?.stateX?.[0]!==n?.state?.stateX?.[0]){return false;}return true;}function _cC_test(p,n){if(p?.state!==n?.state){return false;}return true;}var _oustate=require("oustate");var _useStateValue=(0,_oustate.useStateValue)(abc,undefined,_cC_test),hello=_useStateValue.hello;`
    const { code: transformedCode } =
      transformSync(code, {
        presets: ['module:metro-react-native-babel-preset'],
        plugins: [stateTransformPlugin],
        configFile: false,
      }) || {}
    if (!transformedCode) {
      throw new Error('No code transformed')
    }

    expect(format(transformedCode, { parser: 'babel' })).toBe(format(expectedTransformedCode, { parser: 'babel' }))
  })
})
