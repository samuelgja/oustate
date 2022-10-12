import { rollup } from 'rollup'
import { createInputOption, createOutputOption } from './rollup-configs.mjs'
import { exec } from 'child_process'
import * as fs from 'fs'
import { rootDirectory } from './root-directory.mjs'

// constants
const BUILD_TARGET = 'build'

const PACKAGES = {
  recoil: {
    inputFile: 'Recoil_index.js',
    umdName: 'Recoil',
    builds: {
      common: ['cjs', 'es'],
      dev: ['umd'],
      prod: ['es-browsers', 'umd-prod'],
      native: ['native'],
    },
  },
  refine: {
    inputFile: 'Refine_index.js',
    umdName: 'Refine',
    builds: {
      common: ['cjs', 'es'],
      dev: ['umd'],
      prod: ['es-browsers', 'umd-prod'],
    },
  },
  'recoil-sync': {
    inputFile: 'RecoilSync_index.js',
    umdName: 'RecoilSync',
    builds: {
      common: ['cjs', 'es'],
      dev: ['umd'],
      prod: ['es-browsers', 'umd-prod'],
    },
  },
  'recoil-relay': {
    inputFile: 'RecoilRelay_index.js',
    umdName: 'RecoilRelay',
    builds: {
      common: ['cjs', 'es'],
      dev: ['umd'],
      prod: ['es-browsers', 'umd-prod'],
    },
  },
}

const arguments_ = process.argv.slice(2)
const target = arguments_[0]
if (target === 'all' || target == null) {
  buildAll()
} else {
  if (PACKAGES[target] == null) {
    throw new Error(`Unknown build target ${target}`)
  }
  buildPackage(target, PACKAGES[target])
}

async function buildAll() {
  console.log('Building all packages...\n')
  for (const [target, config] of Object.entries(PACKAGES)) {
    await buildPackage(target, config)
  }
}

async function buildPackage(target, config) {
  console.log(`Building ${target}...`)
  for (const [buildType, packageTypes] of Object.entries(config.builds)) {
    await buildRollup(
      `recoil (${buildType})`,
      createInputOption(buildType, target, config.inputFile),
      packageTypes.map((type) => createOutputOption(type, target, config.umdName)),
    )
  }

  console.log('Copying files...')
  fs.copyFile(
    `${rootDirectory}/packages/${target}/package-for-release.json`,
    `${BUILD_TARGET}/${target}/package.json`,
    fs.constants.COPYFILE_FICLONE,
    createErrorHandler('Failed to copy package-for-release.json'),
  )

  fs.copyFile(
    `${rootDirectory}/README${target === 'recoil' ? '' : '-' + target}.md`,
    `${BUILD_TARGET}/${target}/README.md`,
    fs.constants.COPYFILE_FICLONE,
    createErrorHandler(`Failed to copy README-${target}.md`),
  )
  fs.copyFile(
    `${rootDirectory}/CHANGELOG-${target}.md`,
    `${BUILD_TARGET}/${target}/CHANGELOG.md`,
    fs.constants.COPYFILE_FICLONE,
    createErrorHandler(`Failed to copy CHANGELOG-${target}.md`),
  )
  fs.copyFile(
    `${rootDirectory}/LICENSE`,
    `${BUILD_TARGET}/${target}/LICENSE`,
    fs.constants.COPYFILE_FICLONE,
    createErrorHandler('Failed to copy LICENSE'),
  )

  console.log('Copying index.d.ts for TypeScript support...')
  fs.copyFile(
    `${rootDirectory}/typescript/${target}.d.ts`,
    `${BUILD_TARGET}/${target}/index.d.ts`,
    fs.constants.COPYFILE_FICLONE,
    createErrorHandler(`Failed to copy ${target}.d.ts for TypeScript index.d.ts`),
  )

  console.log('Generating Flow type files...')
  exec(`npx flow-copy-source packages/${target} ${BUILD_TARGET}/${target}/cjs`, (error) => {
    createErrorHandler('Failed to copy source files for Flow types')(error)
    fs.rename(
      `${BUILD_TARGET}/${target}/cjs/${config.inputFile}.flow`,
      `${BUILD_TARGET}/${target}/cjs/index.js.flow`,
      createErrorHandler(`Failed to rename ${config.inputFile}.js.flow`),
    )
  })
  console.log(`Successfully built ${target}!\n`)
}

async function buildRollup(name, inputOptions, outputOptionsList) {
  try {
    // create a bundle
    const bundle = await rollup(inputOptions)

    for (const outputOptions of outputOptionsList) {
      await bundle.write(outputOptions)
    }
  } catch (error) {
    createErrorHandler(`Build for package ${name} failed!`)(error)
  }
}
