/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-shadow */
import { Suspense } from 'react'
import { state } from './state'
import { renderHook, act, waitFor, render, screen } from '@testing-library/react'
describe('state', () => {
  it('should test state', () => {
    const appState = state({ count: 0 })
    expect(appState.get()).toEqual({ count: 0 })
  })

  it('should render state with promise hook', async () => {
    const promise = Promise.resolve({ count: 100 })
    const appState = state(promise)
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return appState()
    })
    // wait for the promise to be resolved
    await waitFor(() => {})
    expect(result.result.current).toEqual({ count: 100 })
    // count rendered
    expect(renderCount.current).toEqual(2)
    expect(appState.get()).toEqual({ count: 100 })
  })

  it('should render state with get promise hook', async () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getPromise = () => Promise.resolve({ count: 100 })
    const appState = state(getPromise)
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return appState()
    })
    // wait for the promise to be resolved
    await waitFor(() => {})
    act(() => {
      appState.set({ count: 15 })
    })
    expect(result.result.current).toEqual({ count: 15 })
    // count rendered
    expect(renderCount.current).toEqual(3)
    expect(appState.get()).toEqual({ count: 15 })
  })

  it('should render state with get promise check default', async () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getPromise = () => Promise.resolve({ count: 100 })
    const appState = state(getPromise)
    // const

    // wait for the promise to be resolved
    await waitFor(() => {})
    act(() => {
      appState.set({ count: 15 })
    })
    expect(appState.get()).toEqual({ count: 15 })
    // count rendered
    act(() => {
      appState.reset()
    })
    expect(appState.get()).toEqual({ count: 15 })
  })

  it('should render state with get hook', async () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const get = () => ({ count: 100 })
    const appState = state(get)
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return appState()
    })
    // wait for the promise to be resolved
    await waitFor(() => {})
    act(() => {
      appState.set({ count: 15 })
    })
    expect(result.result.current).toEqual({ count: 15 })
    // count rendered
    expect(renderCount.current).toEqual(2)
    expect(appState.get()).toEqual({ count: 15 })

    act(() => {
      appState.reset()
    })
    expect(result.result.current).toEqual({ count: 100 })
  })

  it('should render state with get', async () => {
    let wasCalled = false
    const get = () => {
      wasCalled = true
      return { count: 100 }
    }
    const appState = state(get)
    expect(wasCalled).toEqual(false)
    appState.get()
    expect(wasCalled).toEqual(true)
  })
  it('should render state with get hook', async () => {
    let wasCalled = false
    const get = () => {
      wasCalled = true
      return { count: 100 }
    }
    const appState = state(get)
    expect(wasCalled).toEqual(false)
    renderHook(() => {
      appState()
    })
    expect(wasCalled).toEqual(true)
  })

  it('should render state with promise with suspense', async () => {
    const promise = Promise.resolve({ count: 100 })
    const appState = state(promise)
    const renderCount = { current: 0 }

    const MockedComponent = jest.fn(() => <div>loading</div>)
    const MockedComponentAfterSuspense = jest.fn(() => <div>loaded</div>)
    // const
    function Component() {
      renderCount.current++
      return (
        <div>
          {appState().count}
          <MockedComponentAfterSuspense />
        </div>
      )
    }
    render(
      <Suspense fallback={<MockedComponent />}>
        <Component />
      </Suspense>,
    )
    expect(MockedComponent).toHaveBeenCalledTimes(1)
    expect(MockedComponentAfterSuspense).toHaveBeenCalledTimes(0)
    await waitFor(() => {
      return screen.getByText('100')
    })
    expect(MockedComponent).toHaveBeenCalledTimes(1)
    expect(MockedComponentAfterSuspense).toHaveBeenCalledTimes(1)
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

  it('should render state', () => {
    const appState = state({ count: 0 })
    const slice = appState.select((slice) => slice.count)
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return slice()
    })
    expect(result.result.current).toEqual(0)
    // count rendered
    expect(renderCount.current).toEqual(1)
  })

  it('should render state with change', () => {
    const appState = state({ count: 0 })
    const renderCount = { current: 0 }
    // const

    const result = renderHook(() => {
      renderCount.current++
      return appState((slice) => slice)
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
    const useNestedSlice = appState.select((slice) => slice.count)
    const useNestedSliceArray = appState.select((slice) => slice.count.array.length)
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
    const slice1 = mainState.select((slice) => slice.count)
    const slice2FromSlice1 = slice1.select((slice) => slice.nestedCount)

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

  it('should test initial state', () => {
    const appState = state({ count: 0 })
    expect(appState.get()).toEqual({ count: 0 })
  })

  it('should render initial state', () => {
    const appState = state({ count: 0 })
    const renderCount = { current: 0 }

    const result = renderHook(() => {
      renderCount.current++
      return appState()
    })
    expect(result.result.current).toEqual({ count: 0 })
    expect(renderCount.current).toEqual(1)
  })

  it('should render state after change', () => {
    const appState = state({ count: 0 })
    const renderCount = { current: 0 }

    const result = renderHook(() => {
      renderCount.current++
      return appState((slice) => slice)
    })

    act(() => {
      appState.set({ count: 1 })
    })
    expect(result.result.current).toEqual({ count: 1 })
    expect(renderCount.current).toEqual(2)
  })

  it('should render state with nested slice change', () => {
    const appState = state({ count: { nested: 0, array: [0] } })
    const renderCount = { current: 0 }
    const useNestedSlice = appState.select((slice) => slice.count)
    const useNestedSliceArray = appState.select((slice) => slice.count.array.length)

    const result = renderHook(() => appState())
    const sliceResult = renderHook(() => {
      renderCount.current++
      return useNestedSlice()
    })
    const sliceArrayResult = renderHook(() => useNestedSliceArray())

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

  it('should render multiple state slices with updates', () => {
    const mainState = state({ count: { nestedCount: 2 } })
    const slice1 = mainState.select((slice) => slice.count)
    const slice2FromSlice1 = slice1.select((slice) => slice.nestedCount)

    const slice2FromSlice1Result = renderHook(() => slice2FromSlice1())
    expect(slice2FromSlice1Result.result.current).toEqual(2)

    act(() => {
      mainState.set({ count: { nestedCount: 3 } })
    })
    expect(slice2FromSlice1Result.result.current).toEqual(3)
  })

  it('should render multiple components observing the same state', () => {
    const appState = state({ count: 0 })
    const renderCount1 = { current: 0 }
    const renderCount2 = { current: 0 }

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

  it('should reset state to default value', () => {
    const appState = state({ count: 0 })
    act(() => {
      appState.set({ count: 10 })
    })
    expect(appState.get()).toEqual({ count: 10 })

    act(() => {
      appState.reset()
    })
    expect(appState.get()).toEqual({ count: 0 })
  })

  it('should handle updates with deep nesting in state', () => {
    const appState = state({ data: { nested: { value: 1 } } })
    const nestedSlice = appState.select((s) => s.data.nested.value)

    const result = renderHook(() => nestedSlice())
    expect(result.result.current).toEqual(1)

    act(() => {
      appState.set({ data: { nested: { value: 2 } } })
    })
    expect(result.result.current).toEqual(2)
  })

  it('should not re-render for unrelated slice changes', () => {
    const appState = state({ count: 0, unrelated: 5 })
    const renderCount = { current: 0 }

    const countSlice = appState.select((state) => state.count)
    const unrelatedSlice = appState.select((state) => state.unrelated)

    renderHook(() => {
      renderCount.current++
      return countSlice()
    })

    const unrelatedResult = renderHook(() => unrelatedSlice())
    expect(renderCount.current).toEqual(1)

    act(() => {
      return appState.set({ unrelated: 10 } as never)
    })

    expect(unrelatedResult.result.current).toEqual(10)
    expect(renderCount.current).toEqual(2) // No re-render for count slice
  })
})