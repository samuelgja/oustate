import { createState, useStateValue } from '../packages/core'
import { act, renderHook, RenderResult } from '@testing-library/react-hooks'
import { renderHookWithCount } from './utils'

describe('Basic state', () => {
  it('should create a state', () => {
    const state = createState({ count: 0 })
    expect(state).toBeDefined()
  })

  it('should set state & get state', () => {
    const state = createState({ count: 0 })
    state.setState({ count: 1 })
    expect(state.getState().count).toBe(1)
  })
  it('should get state in react hook and set state', () => {
    const state = createState({ count: 0 })
    const { result } = renderHook(() => useStateValue(state))
    expect(result.current.count).toBe(0)
    act(() => {
      state.setState({ count: 1 })
    })
    expect(result.current.count).toBe(1)
  })
  it('should get state in react hook and re-renders count should be 2', () => {
    const state = createState({ count: 0 })
    const { result } = renderHookWithCount(() => useStateValue(state))
    expect(result.current.hook.count).toBe(0)
    act(() => {
      state.setState({ count: 1 })
    })
    expect(result.current.hook.count).toBe(1)
    expect(result.current.renderCount).toBe(2)
  })

  it('should create state & render it to 100 components at the same time', async () => {
    const state = createState({ count: 0 })
    const renderIt = () => {
      const { result } = renderHookWithCount(() => useStateValue(state))
      expect(result.current.hook.count).toBe(0)
      return result
    }
    const results: RenderResult<{
      renderCount: number
      hook: {
        count: number
      }
    }>[] = []
    for (let index = 0; index < 100; index++) {
      results.push(renderIt())
    }
    act(() => {
      state.setState({ count: 1 })
    })
    for (let index = 0; index < results.length; index++) {
      expect(results[index].current.hook.count).toBe(1)
    }
  })
  it('should create big object state & update only one value should be same', () => {
    const state = createState({ count: 0, anotherCount: 0, thirdCount: 0, someObject: { a: 1, b: 2, c: 3 } })
    const { result } = renderHook(() => useStateValue(state))
    expect(result.current.count).toBe(0)
    expect(result.current.anotherCount).toBe(0)
    act(() => {
      state.setState((old) => ({ ...old, count: 1 }))
    })
    expect(result.current.count).toBe(1)
    expect(result.current).toStrictEqual({ count: 1, anotherCount: 0, thirdCount: 0, someObject: { a: 1, b: 2, c: 3 } })
  })

  it('should subscribe to state and return value when changed', () => {
    const state = createState({ count: 0 })
    state.subscribe(({ prev, next }) => {
      expect(prev.count).toBe(0)
      expect(next.count).toBe(1)
    })
    act(() => {
      state.setState({ count: 1 })
    })
  })

  it('should subscribe to state and unsubscribe', () => {
    const state = createState({ count: 0 })
    const unsubscribe = state.subscribe(({ prev, next }) => {
      // doesn't matter cuz this will be not fired
      expect(prev.count).toBe(100)
      expect(next.count).toBe(100)
    })
    unsubscribe()
    act(() => {
      state.setState({ count: 1 })
    })
  })
  it('should subscribe 100 listeners to the state and get result', () => {
    const state = createState({ count: 0 })
    for (let index = 0; index < 100; index++) {
      state.subscribe(({ prev, next }) => {
        expect(prev.count).toBe(0)
        expect(next.count).toBe(1)
      })
    }
    act(() => {
      state.setState({ count: 1 })
    })
  })
  it('should subscribe 100 listeners to the state and unsubscribe and get result', () => {
    const state = createState({ count: 0 })
    const unsubscribe: Array<() => void> = []
    for (let index = 0; index < 100; index++) {
      unsubscribe.push(
        state.subscribe(({ prev, next }) => {
          // doesn't matter cuz this will be not fired
          expect(prev.count).toBe(100)
          expect(next.count).toBe(100)
        }),
      )
    }
    for (const callback of unsubscribe) callback()
    act(() => {
      state.setState({ count: 1 })
    })
  })
})
