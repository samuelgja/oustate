import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { ReRenderCounter } from '../components/re-render-counter'
import React from 'react'
import { createComputed, createState, useStateValue } from '../../src'
import { observer } from 'mobx-react-lite'
import { observable, computed, configure } from 'mobx'

const TOTAL_COUNT = 1_000

interface Props {
  onFinish?: () => void
}
// MOBX TEST
configure({ enforceActions: 'never' })
const mobxCount = observable.box(0)
export const BenchmarkMobxState = observer(({ onFinish }: Props) => {
  const count = mobxCount.get()
  return (
    <ReRenderCounter
      onFinish={onFinish}
      value={count}
      onIncrement={() => mobxCount.set(count + 1)}
      totalCount={TOTAL_COUNT}
      name={'Mobx'}
    />
  )
})

// MOBX COMPUTED

const mobxCount2 = observable.box(0)
const mobxComputedCount = computed(() => {
  return mobxCount2.get() + 1
})
export const BenchmarkMobxStateComputed = observer(({ onFinish }: Props) => {
  const count = mobxComputedCount.get()
  return (
    <ReRenderCounter
      onFinish={onFinish}
      value={count}
      onIncrement={() => mobxCount2.set(count + 1)}
      totalCount={TOTAL_COUNT}
      name={'Mobx computed'}
    />
  )
})

// RECOIL TEST
const recoilCountAtom = atom({ key: 'recoilCount', default: 0 })

export const BenchmarkRecoilState = ({ onFinish }: Props) => {
  const [count, setCount] = useRecoilState(recoilCountAtom)
  return (
    <ReRenderCounter
      onFinish={onFinish}
      value={count}
      onIncrement={() => setCount(count + 1)}
      totalCount={TOTAL_COUNT}
      name={'Recoil Atom'}
    />
  )
}

// RECOIL SELECTOR
const recoilCount2Atom = atom({ key: 'recoilCount2', default: 0 })
const recoilCountSelector = selector({
  key: 'recoilCountselcetor',
  get: ({ get }) => {
    return get(recoilCount2Atom) + 1
  },
})

export const BenchmarkRecoilSelector = ({ onFinish }: Props) => {
  const count = useRecoilValue(recoilCountSelector)
  const setCount = useSetRecoilState(recoilCount2Atom)

  return (
    <ReRenderCounter
      onFinish={onFinish}
      value={count}
      onIncrement={() => setCount(count + 1)}
      totalCount={TOTAL_COUNT}
      name={'Recoil Selector'}
    />
  )
}

// THIS STATE TEST
const counterState = createState(0)

export const BenchmarkThisState = ({ onFinish }: Props) => {
  const count = useStateValue(counterState)
  return (
    <ReRenderCounter
      onFinish={onFinish}
      value={count}
      onIncrement={() => counterState.setState(count + 1)}
      totalCount={TOTAL_COUNT}
      name={'This state'}
    />
  )
}

// THIS STATE COMPUTED

const counterState2 = createState(0)
const computedCounter = createComputed(({ get }) => {
  return get(counterState2) + 1
})

export const BenchmarkThisStateComputed = ({ onFinish }: Props) => {
  const count = useStateValue(computedCounter)
  return (
    <ReRenderCounter
      onFinish={onFinish}
      value={count}
      onIncrement={() => counterState2.setState(count + 1)}
      totalCount={TOTAL_COUNT}
      name={'This state computed'}
    />
  )
}

export const BenchmarkStates = () => {
  const [currentTest, setCurrentTest] = React.useState(0)

  return (
    <div>
      {currentTest === 0 ? <BenchmarkMobxState onFinish={() => setCurrentTest(1)} /> : null}
      {currentTest === 1 ? <BenchmarkRecoilState onFinish={() => setCurrentTest(2)} /> : null}
      {currentTest === 2 ? <BenchmarkThisState onFinish={() => setCurrentTest(3)} /> : null}
      {currentTest === 3 ? <BenchmarkThisStateComputed onFinish={() => setCurrentTest(4)} /> : null}
      {currentTest === 4 ? <BenchmarkRecoilSelector onFinish={() => setCurrentTest(5)} /> : null}
      {currentTest === 5 ? <BenchmarkMobxStateComputed onFinish={() => setCurrentTest(6)} /> : null}
    </div>
  )
}
