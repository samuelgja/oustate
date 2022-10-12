import { createState, createComputed, useStateValue, ComputedState } from '../src'
import { act, renderHook } from '@testing-library/react-hooks'

describe('Nested Computed states', () => {
  it('should create computed and nested computed state from state', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    const nestedComputed = createComputed(({ get }) => {
      return get(computed, (value) => value)
    })
    expect(nestedComputed).toBeDefined()
  })
  it('should create computed and nested computed state from state and get value', async () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    const nestedComputed = createComputed(({ get }) => {
      return get(computed, (value) => value)
    })
    expect(await nestedComputed.getState()).toBe(0)
  })
  it('should create computed and nested computed state from state and get value in react hook', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    const nestedComputed = createComputed(({ get }) => {
      return get(computed, (value) => value)
    })
    const { result } = renderHook(() => useStateValue(nestedComputed))
    expect(result.current).toBe(0)

    act(() => {
      state.setState({ count: 1 })
    })
    expect(result.current).toBe(1)
  })
  it('should create computed and 100 nested computed states from state and get value in react hook', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    const nestedComputed: ComputedState<any>[] = []
    for (let index = 0; index < 100; index++) {
      const nested = createComputed(({ get }) => {
        return get(index === 0 ? computed : nestedComputed[index - 1], (value) => value)
      })
      nestedComputed.push(nested)
    }
    const { result } = renderHook(() => useStateValue(nestedComputed[99]))
    expect(result.current).toBe(0)
    act(() => {
      state.setState({ count: 1 })
    })
    expect(result.current).toBe(1)
  })
})
