/* eslint-disable unicorn/prevent-abbreviations */
import nodeResolver from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import path from 'path'

const outFolder = 'lib'
function external(id) {
  return !id.startsWith('.') && !id.startsWith(root)
}

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
        preserveModulesRoot: 'packages/core',
        name: 'index',
        file: path.resolve(outDir, 'index.js'),
      }
    : {
        format,
        preserveModules: true,
        preserveModulesRoot: 'packages/core',
        dir: outDir,
      }

  let replacer
  let resolver
  if (format === 'umd') {
    output.name = 'index'
    output.globals = {
      react: 'React',
      // 'use-sync-external-store/shim/with-selector': 'useSyncExternalStoreShimWithSelector',
    }

    resolver = nodeResolver()
  } else {
    replacer = replace({
      __DEV__: '(import.meta.env&&import.meta.env.MODE)!=="production"',
      'use-sync-external-store': 'use-sync-external-store',
      preventAssignment: true,
    })
  }
  return {
    input: ['./packages/core/index.ts'],
    output,
    external,
    plugins: [
      replacer,
      resolver,
      commonjs({
        namedExports: {
          'use-sync-external-store/shim/with-selector': ['useSyncExternalStoreWithSelector'],
        },
      }),
      typescript({ outDir, declaration: isTypes }),
      terser({ compress: { passes: 2, dead_code: false } }),
    ],
    external: ['react', 'react-dom'],
  }
}
