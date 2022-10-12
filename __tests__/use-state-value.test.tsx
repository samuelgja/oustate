import { act } from 'react-test-renderer'
import { createComputed, createSlice, createState, useStateValue } from '../src'
import { renderHookWithCount } from './utils'
const awaiter = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
describe('UseStateValue tests', () => {
  it("should return state's value", () => {
    const state = createState(0)
    const { result } = renderHookWithCount(() => useStateValue(state))
    expect(result.current.hook).toBe(0)
  })
  it('should return state value from complex object', () => {
    const state = createState({ count: 0, anotherCount: 0 })
    const { result } = renderHookWithCount(() => useStateValue(state))
    expect(result.current.hook).toStrictEqual({ count: 0, anotherCount: 0 })
  })
  it('should return value from computed state which is connect to state', () => {
    const state = createState({ count: 0, anotherCount: 0 })
    const computedState = createComputed(({ get }) => {
      return get(state)
    })
    const { result } = renderHookWithCount(() => useStateValue(computedState))
    expect(result.current.hook).toStrictEqual({ count: 0, anotherCount: 0 })
  })
  it('should return value from async computed state which is connected to state', async () => {
    const state = createState({ count: 0, anotherCount: 0 })
    const waitTime = 10
    const computedState = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(state)
    })
    const { result } = renderHookWithCount(() => useStateValue(computedState))
    await act(async () => {
      await awaiter(waitTime * 2)
    })
    expect(result.current.hook).toStrictEqual({ count: 0, anotherCount: 0 })
  })
  it('should return value from slice state which is connect to state', () => {
    const state = createState({ count: 0, anotherCount: 0 })
    const computedState = createSlice(state, (value) => value)
    const { result } = renderHookWithCount(() => useStateValue(computedState))
    expect(result.current.hook).toStrictEqual({ count: 0, anotherCount: 0 })
  })
})
