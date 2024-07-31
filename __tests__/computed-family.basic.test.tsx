import { createComputedFamily, createState, useStateValue } from '../packages/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { useRef } from 'react'

const renderHookWithCount = <T,>(hook: () => T) =>
  renderHook(() => {
    const countRef = useRef(0)
    countRef.current++
    return { renderCount: countRef.current, hook: hook() }
  })

describe('Basic Computed family states', () => {
  it('should create computed family from state', () => {
    const state = createState({ count: 0 })
    const computed = createComputedFamily(({ get }) => {
      return get(state, (value) => value.count)
    })
    expect(computed).toBeDefined()
  })
  it('should create computed family from state and get value', async () => {
    const state = createState({ count: 0 })
    const computed = createComputedFamily(({ get }) => {
      return get(state, (value) => value.count)
    })

    expect(await computed('key').get()).toBe(0)
  })
  it('should create computed family from state and get value in react hook', () => {
    const state = createState({ count: 0 })
    const computed = createComputedFamily(({ get }) => {
      return get(state, (value) => value.count)
    })
    const { result } = renderHook(() => useStateValue(computed('key')))
    expect(result.current).toBe(0)
  })
  it('should create computed family from state and get value in react hook and re-render count should be 2', () => {
    const state = createState({ count: 0 })
    const computed = createComputedFamily(({ get }) => {
      return get(state, (value) => value.count)
    })
    const { result } = renderHookWithCount(() => useStateValue(computed('key')))
    expect(result.current.renderCount).toBe(1)

    act(() => {
      state.set({ count: 1 })
    })
    expect(result.current.renderCount).toBe(2)
  })
  it('should subscribe to computed family and return value when changed', async () => {
    const state = createState({ count: 0 })
    const computed = createComputedFamily(({ get }) => {
      return get(state, (value) => value.count)
    })

    computed('key').subscribe(({ prev, next }) => {
      expect(prev).toBe(0)
      expect(next).toBe(1)
    })
    act(() => {
      state.set({ count: 1 })
    })
  })
})
