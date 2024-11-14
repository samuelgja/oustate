import { state } from './state'
import { renderHook, act } from '@testing-library/react'
describe('state', () => {
  it('should test state', () => {
    const appState = state({ count: 0 })
    expect(appState.get()).toEqual({ count: 0 })
  })
  it('should render state', () => {
    const appState = state({ count: 0 })
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return appState()
    })
    expect(result.result.current).toEqual({ count: 0 })
    // count rendered
    expect(renderCount.current).toEqual(1)
  })

  it('should render state with change', () => {
    const appState = state({ count: 0 })
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return appState()
    })

    act(() => {
      appState.set({ count: 1 })
    })
    expect(result.result.current).toEqual({ count: 1 })
    expect(renderCount.current).toEqual(2)
  })

  it('should render state with slice change', () => {
    const appState = state({ count: { nested: 0, array: [0] } })
    const renderCount = { current: 0 }
    const useNestedSlice = appState.slice((slice) => slice.count)
    const useNestedSliceArray = appState.slice((slice) => slice.count.array.length)
    const result = renderHook(() => {
      return appState()
    })
    const sliceResult = renderHook(() => {
      renderCount.current++
      return useNestedSlice()
    })
    const sliceArrayResult = renderHook(() => {
      return useNestedSliceArray()
    })
    expect(sliceArrayResult.result.current).toEqual(1)
    expect(sliceResult.result.current).toEqual({ nested: 0, array: [0] })
    act(() => {
      appState.set({ count: { nested: 2, array: [0] } })
    })

    expect(result.result.current).toEqual({ count: { nested: 2, array: [0] } })
    expect(sliceResult.result.current).toEqual({ nested: 2, array: [0] })

    act(() => {
      appState.set({ count: { nested: 2, array: [1, 2, 4] } })
    })
    expect(sliceArrayResult.result.current).toEqual(3)
  })

  it('should render multiple state', () => {
    const mainState = state({ count: { nestedCount: 2 } })
    const slice1 = mainState.slice((slice) => slice.count)
    const slice2FromSlice1 = slice1.slice((slice) => slice.nestedCount)

    const slice2FromSlice1Result = renderHook(() => slice2FromSlice1())
    expect(slice2FromSlice1Result.result.current).toEqual(2)

    act(() => {
      mainState.set({ count: { nestedCount: 3 } })
    })
    expect(slice2FromSlice1Result.result.current).toEqual(3)
  })

  it('should render multiple state with change', () => {
    const appState = state({ count: 0 })
    const renderCount1 = { current: 0 }
    const renderCount2 = { current: 0 }
    // const

    const result1 = renderHook(() => {
      renderCount1.current++
      return appState()
    })
    const result2 = renderHook(() => {
      renderCount2.current++
      return appState((slice) => slice.count)
    })
    act(() => {
      appState.set({ count: 1 })
    })
    expect(result1.result.current).toEqual({ count: 1 })
    expect(result2.result.current).toEqual(1)
    expect(renderCount1.current).toEqual(2)
    expect(renderCount2.current).toEqual(2)
  })
})
