import { createState, createComputed, useStateValue } from '../packages/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { useRef } from 'react'

const renderHookWithCount = <T,>(hook: () => T) =>
  renderHook(() => {
    const countRef = useRef(0)
    countRef.current++
    return { renderCount: countRef.current, hook: hook() }
  })

describe('Basic Computed states', () => {
  it('should create computed state from state', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    expect(computed).toBeDefined()
  })
  it('should create computed state from state and get value', async () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })

    expect(await computed.getState()).toBe(0)
  })
  it('should create computed state from state and get value in react hook', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    const { result } = renderHook(() => useStateValue(computed))
    expect(result.current).toBe(0)
  })
  it('should create computed state from state and get value in react hook and re-render count should be 2', () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })
    const { result } = renderHookWithCount(() => useStateValue(computed))
    expect(result.current.renderCount).toBe(1)

    act(() => {
      state.setState({ count: 1 })
    })
    expect(result.current.renderCount).toBe(2)
  })
  it('should subscribe to computed state and return value when changed', async () => {
    const state = createState({ count: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.count)
    })

    computed.subscribe(({ prev, next }) => {
      expect(prev).toBe(0)
      expect(next).toBe(1)
    })
    act(() => {
      state.setState({ count: 1 })
    })
  })
})
