const Benchmark = require('benchmark')
const { createComputed, createState } = require('../lib')
const suite = new Benchmark.Suite()

const { selector, atom } = require('recoil')

const createComputedSimple = () => {
  const id = 1
  return () => {
    return { id }
  }
}

const computedState = createComputed(() => ({ hello: 'world' }))
const ccc2 = createComputedSimple()

let aaa = 0
// add tests
suite

  .add('create state', function () {
    aaa++
    const abc = createState({ hello: 'world' })
  })
  .add('create recoil atom', function () {
    aaa++
    const abc = atom({ key: 'atom' + aaa, default: { hello: 'world' } })
  })
  .add('create computed', function () {
    aaa++
    const abc = createComputed(() => ({ hello: 'world' }))
  })
  .add('create recoil selector', function () {
    aaa++
    const abc = selector({ key: 'ejej' + aaa, get: () => ({ hello: 'world' }) })
  })
  .add('get computed computed', function () {
    computedState.getState()
  })

  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  // run async
  .run({ async: true })
