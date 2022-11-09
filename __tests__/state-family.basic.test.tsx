import { createStateFamily, useStateValue } from '../packages/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { renderHookWithCount } from './utils'

describe('Basic state family', () => {
  it('should create a state family', () => {
    const state = createStateFamily({ count: 0 })
    expect(state(2)).toBeDefined()
  })
  it("should create a state family and get it's state", () => {
    const state = createStateFamily({ count: 0 })
    expect(state(2).getState().count).toBe(0)
  })
  it("should create a state family and get it's state in react hook", () => {
    const state = createStateFamily({ count: 0 })
    const { result } = renderHook(() => useStateValue(state(2)))
    expect(result.current.count).toBe(0)
  })
  it("should create a state family and get it's state in react hook and re-render count should be 2", () => {
    const state = createStateFamily({ count: 0 })
    const { result } = renderHookWithCount(() => useStateValue(state(2)))
    expect(result.current.renderCount).toBe(1)

    act(() => {
      state(2).setState({ count: 1 })
    })
    expect(result.current.renderCount).toBe(2)
  })
  it("should create a state family and get it's state in react hook and re-render count should be 1 because of using different family", () => {
    const state = createStateFamily({ count: 0 })
    const { result } = renderHookWithCount(() => useStateValue(state(1)))
    expect(result.current.renderCount).toBe(1)

    act(() => {
      state(2).setState({ count: 1 })
    })
    expect(result.current.renderCount).toBe(1)
  })
})
