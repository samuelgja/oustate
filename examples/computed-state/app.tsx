import { createState, useStateValue } from '../../packages/core'
import React, { useRef } from 'react'

const countersState = createState({ counter1: 0, counter2: 0 })

const incrementCounter1Action = () =>
  countersState.setState((old) => {
    old.counter1++
    return { ...old }
  })
const incrementCounter2Action = () =>
  countersState.setState((old) => {
    old.counter2++
    return { ...old }
  })

const incrementAll = () =>
  countersState.setState((old) => {
    old.counter1++
    old.counter2++
    return { ...old }
  })

const Counter1Component = () => {
  const reRenders = useRef(0)
  const counter1 = useStateValue(countersState, (user) => user.counter1)

  reRenders.current++
  console.log('re-render')
  return (
    <>
      <p>re-renders count: {reRenders.current}</p>
      <h4>Counter value:{counter1}</h4>
      <button onClick={incrementCounter1Action}>Increment</button>
    </>
  )
}

const Counter2Component = () => {
  const reRenders = useRef(0)
  const counter2 = useStateValue(countersState, (user) => user.counter2)

  reRenders.current++
  return (
    <>
      <p>re-renders count: {reRenders.current}</p>
      <h4>Counter value:{counter2}</h4>
      <button onClick={incrementCounter2Action}>Increment</button>
    </>
  )
}
export default function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column' }}>
      <h1>Simple state with care about re-renders</h1>
      <Counter1Component />
      <Counter2Component />
      <button onClick={incrementAll}>Increment all</button>
    </div>
  )
}
