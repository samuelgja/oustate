import { createState, createSlice, useStateValue, ComputedState } from '../packages/core'
import { act } from '@testing-library/react-hooks'
import { renderHookWithCount } from './utils'

const waitTime = 2

const awaiter = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Basic Slice states', () => {
  it('should create state & create slice state from it', async () => {
    const state = createState({ count: 0 })
    const slice = createSlice(state, (value) => value.count)
    expect(slice).toBeDefined()
  })
  it('should create state & create slice state from it', async () => {
    const state = createState({ count: 0 })
    const slice = state.slice((value) => value.count)
    expect(slice).toBeDefined()
  })
  it('should create state & create slice state from it and get value', async () => {
    const state = createState({ count: 0 })
    const slice = createSlice(state, (value) => value.count)
    expect(await slice.get()).toBe(0)
  })

  it('should create state & create slice state from it and get value', async () => {
    const state = createState({ count: 10 })
    const slice = state.slice((value) => value.count)
    expect(await slice.get()).toBe(10)
  })
  it('should create state & create slice state from it and get value in react hook and re-render count should be 2', async () => {
    const state = createState({ count: 0 })
    const slice = createSlice(state, (value) => value.count)
    const { result, rerender } = renderHookWithCount(() => useStateValue(slice))
    await act(async () => {
      await awaiter(waitTime * 2)
    })
    expect(result.current.hook).toBe(0)
    act(() => {
      state.set({ count: 1 })
    })
    await act(async () => {
      await awaiter(waitTime * 2)
    })
    expect(result.current.hook).toBe(1)
    rerender()
    expect(result.current.hook).toBe(1)
  })
  it("should create state & create slice state from it and get value in react hook and re-render count should be 2 and it's not equal to 0", async () => {
    const state = createState({ count: 0 })
    const slice = createSlice(state, (value) => value.count)
    const { result, rerender } = renderHookWithCount(() => useStateValue(slice))
    await act(async () => {
      await awaiter(waitTime * 2)
    })
    expect(result.current.hook).toBe(0)
    act(() => {
      state.set({ count: 1 })
    })
    await act(async () => {
      await awaiter(waitTime * 2)
    })

    expect(result.current.renderCount).toBe(2)
    expect(result.current.hook).toBe(1)
    rerender()
    expect(result.current.hook).toBe(1)
  })
  it('should create basic state and add 100 slices components to it & render it', () => {
    const state = createState({ count: 0 })
    const slices: ComputedState<number>[] = []
    for (let index = 0; index < 100; index++) {
      const slicer = createSlice(state, (value) => value.count)
      slices.push(slicer)
    }
    for (let index = 0; index < slices.length; index++) {
      const { result } = renderHookWithCount(() => useStateValue(slices[index]))
      expect(result.current.renderCount).toBe(1)
      act(() => {
        state.set({ count: 1 })
      })
      expect(result.current.hook).toBe(1)
      if (index === 0) {
        // only first one will re-render twice
        expect(result.current.renderCount).toBe(2)
      } else {
        expect(result.current.renderCount).toBe(1)
      }
    }
  })
})
