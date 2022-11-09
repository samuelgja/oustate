import { createState, createComputed, useStateValue, ComputedState } from '../packages/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { renderHookWithCount } from './utils'

const waitTime = 2

const awaiter = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Basic Async Computed states', () => {
  it('should create computed async state from state', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(async ({ get }) => {
      // here will await for 100ms
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })
    expect(computed).toBeDefined()
  })
  it('should create computed async state from state and get value', async () => {
    const state = createState({ count: 0 })
    const computed = createComputed(async ({ get }) => {
      // here will await for 100ms
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })
    expect(await computed.getState()).toBe(0)
  })
  it('should create computed async state from state and get value in react hook', async () => {
    const state = createState({ count: 0 })
    const computed = createComputed(async ({ get }) => {
      // here will await for 100ms
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })
    const { result } = renderHook(() => useStateValue(computed))
    await act(async () => {
      await awaiter(waitTime * 2)
    })

    expect(result.current).toBe(0)
  })
  it('should create computed async state from state and get value in react hook and re-render count should be 2', async () => {
    const state = createState({ count: 0 })
    const computed = createComputed(async ({ get }) => {
      // here will await for 100ms
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })
    const { result } = renderHook(() => useStateValue(computed))

    await act(async () => {
      await awaiter(waitTime * 2)
    })

    expect(result.current).toBe(0)
    act(() => {
      state.setState({ count: 1 })
    })
    await act(async () => {
      await awaiter(waitTime * 2)
    })

    expect(result.current).toBe(1)
  })
  it('should create 100 nested async computed and get value in react hook and re-render count should be 3', async () => {
    const nestedComputed: ComputedState<any>[] = []
    const state = createState({ count: 0 })
    const computed = createComputed(async ({ get }) => {
      // here will await for 100ms
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })

    const testCount = 100

    for (let index = 0; index < testCount; index++) {
      nestedComputed.push(
        createComputed(async ({ get }) => {
          // here will await for 100ms
          await awaiter(waitTime)
          return get(computed, (value) => value)
        }),
      )
    }
    const { result } = renderHookWithCount(() => useStateValue(nestedComputed[99]))
    await act(async () => {
      await awaiter(waitTime * testCount)
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(1)

    act(() => {
      state.setState({ count: 1 })
    })
    await act(async () => {
      await awaiter(waitTime * testCount)
    })
    expect(result.current.hook).toBe(1)
    // received 3 re-renders because its async state - so it goes to loading state & after loading it goes back to normal state
    expect(result.current.renderCount).toBe(3)
  })
  it('should create 100 nested odd async computed / even sync computed and get value in react hook and re-render count should be 3', async () => {
    const nestedComputed: ComputedState<any>[] = []
    const state = createState({ count: 0 })
    const computed = createComputed(async ({ get }) => {
      // here will await for 100ms
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })

    const testCount = 100

    for (let index = 0; index < testCount; index++) {
      if (index % 2 === 0) {
        nestedComputed.push(
          createComputed(async ({ get }) => {
            // here will await for 100ms
            await awaiter(waitTime)
            return get(computed, (value) => value)
          }),
        )
      } else {
        nestedComputed.push(
          createComputed(({ get }) => {
            return get(computed, (value) => value)
          }),
        )
      }
    }
    const { result } = renderHookWithCount(() => useStateValue(nestedComputed[99]))
    await act(async () => {
      await awaiter(waitTime * testCount)
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(1)

    act(() => {
      state.setState({ count: 1 })
    })
    await act(async () => {
      await awaiter(waitTime * testCount)
    })
    expect(result.current.hook).toBe(1)
    // received 3 re-renders because its async state - so it goes to loading state & after loading it goes back to normal state
    expect(result.current.renderCount).toBe(3)
  })
})
