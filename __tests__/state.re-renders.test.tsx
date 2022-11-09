import { createState, useStateValue } from '../packages/core'
import { act } from '@testing-library/react-hooks'
import { renderHookWithCount } from './utils'

describe('Re-renders state', () => {
  it('should create complex state, change state, count re-renders to be only 1', () => {
    const state = createState({ count: 0, anotherCount: 0 })
    const { result } = renderHookWithCount(() => useStateValue(state, (value) => value.anotherCount))

    act(() => {
      state.setState((old) => ({ ...old, count: 1 }))
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.setState((old) => ({ ...old, anotherCount: 100 }))
    })
    expect(result.current.renderCount).toBe(2)
  })

  it('should create object state and check if re-render when use isEqual', () => {
    const state = createState(
      { count: 0, anotherCount: 0, thirdCount: 0, someObject: { a: 1, b: 2, c: 3 } },
      {
        isSame: () => {
          // just return true - so value will be never updated
          return true
        },
      },
    )
    const { result } = renderHookWithCount(() => useStateValue(state))
    expect(result.current.hook.count).toBe(0)
    act(() => {
      state.setState((old) => ({ ...old, count: 1 }))
    })
    // we blocked change via isSame - so value cannot be changed
    expect(result.current.hook.count).toBe(0)
    expect(result.current.renderCount).toBe(1)
  })
  it('should create object state and check if re-render when use isEqual in state selector', () => {
    const state = createState({ count: 0, anotherCount: 0, thirdCount: 0, someObject: { a: 1, b: 2, c: 3 } })
    const { result } = renderHookWithCount(() =>
      useStateValue(
        state,
        (value) => value,
        () => {
          // just return true - so value will be never updated
          return true
        },
      ),
    )
    expect(result.current.hook.count).toBe(0)
    act(() => {
      state.setState((old) => ({ ...old, count: 1 }))
    })
    // we blocked change via isSame - so value cannot be changed
    expect(result.current.hook.count).toBe(0)
    expect(result.current.renderCount).toBe(1)
  })
  it('should check re-renders for real world example 1', () => {
    const countersState = createState({ counter1: 0, counter2: 0 })

    const incrementCounter1Action = () =>
      countersState.setState((old) => {
        old.counter1++
        return { ...old }
      })

    const { result } = renderHookWithCount(() => {
      const counter1 = useStateValue(countersState, (user) => user.counter1)
      return counter1
    })

    expect(result.current.renderCount).toBe(1)
    act(incrementCounter1Action)
    expect(result.current.renderCount).toBe(2)
    act(incrementCounter1Action)
    expect(result.current.renderCount).toBe(3)
    act(incrementCounter1Action)
    expect(result.current.renderCount).toBe(4)
  })
})
