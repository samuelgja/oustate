/* eslint-disable unicorn/prevent-abbreviations */
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import path from 'path'

const outFolder = 'lib'

export default function (arguments_) {
  const outDir = path.resolve(outFolder, arguments_.format)

  const isTypes = arguments_.format === 'types'
  if (isTypes) {
    arguments_.format = 'cjs'
  }

  const isDirDisabled = isTypes || arguments_.format === 'umd'

  const { format } = arguments_

  let output

  output = isDirDisabled
    ? {
        format,
        preserveModules: false,
        preserveModulesRoot: 'src',
        name: 'index',
        file: path.resolve(outDir, 'index.js'),
      }
    : {
        format,
        preserveModules: true,
        preserveModulesRoot: 'src',
        dir: outDir,
      }
  return {
    input: ['./src/index.ts'],
    output,
    plugins: [
      replace({
        __DEV__: '(import.meta.env&&import.meta.env.MODE)!=="production"',
        'use-sync-external-store/shim/with-selector': 'use-sync-external-store/shim/with-selector.js',
        preventAssignment: true,
      }),
      resolve(),
      commonjs({
        namedExports: {
          'use-sync-external-store/shim/with-selector': ['useSyncExternalStoreWithSelector'],
        },
      }),
      typescript({ outDir, declaration: isTypes }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  }
}
