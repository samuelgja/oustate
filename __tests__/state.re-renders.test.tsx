import { createState, useStateValue } from '../src'
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
})
