import { createState, createComputed, useStateValue } from '../packages/core'
import { act } from '@testing-library/react-hooks'
import { renderHookWithCount } from './utils'

const waitTime = 2

const awaiter = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Basic Async Computed states', () => {
  it('should create complex state & computed from it & change value in state but re-render computed', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(state, (value) => value.count)
    })
    const { result } = renderHookWithCount(() => useStateValue(computed))

    await act(async () => {
      await awaiter(waitTime * 2)
    })

    expect(result.current.hook).toBe(0)
    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })
    await act(async () => {
      await awaiter(waitTime * 2)
    })
    expect(result.current.renderCount).toBe(3)
    expect(result.current.hook).toBe(1)
  })
  it('should create complex state & computed from it & change value in state but not re-render computed', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(state, (value) => value.someOtherValue)
    })
    const { result } = renderHookWithCount(() => useStateValue(computed))

    await act(async () => {
      await awaiter(waitTime * 2)
    })

    expect(result.current.hook).toBe(0)
    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })
    await act(async () => {
      await awaiter(waitTime * 2)
    })
    expect(result.current.renderCount).toBe(1)
    expect(result.current.hook).toBe(0)
  })
  it('should create async computed & and async nested computed, change of computed will not re-render child computed (only trigger loading)', async () => {
    // this case re-render nested computed each time - because parent computed is async - so there need to be loader started before change is applied
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(state, (value) => value)
    })
    const nestedComputed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(computed, (value) => value.someOtherValue)
    })

    const { result } = renderHookWithCount(() => useStateValue(nestedComputed))
    await act(async () => {
      await awaiter(waitTime * 4)
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })
    await act(async () => {
      await awaiter(waitTime * 4)
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(3)
  })
  it('should create sync computed & and async nested computed, change of computed will not re-render child computed', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value)
    })
    const nestedComputed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(computed, (value) => value.someOtherValue)
    })

    const { result } = renderHookWithCount(() => useStateValue(nestedComputed))
    await act(async () => {
      await awaiter(waitTime * 4)
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })
    await act(async () => {
      await awaiter(waitTime * 4)
    })
    expect(result.current.hook).toBe(0)
    expect(result.current.renderCount).toBe(1)
  })

  it('should create computed state and block update via isSame', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(
      ({ get }) => {
        return get(state)
      },
      { isSame: () => true },
    )

    act(() => {
      state.set((old) => ({ ...old, count: old.count + 1 }))
    })

    expect(await computed.get()).toStrictEqual({ count: 1, someOtherValue: 0 })
  })
  it('should create computed state and block update via isSame', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(
      ({ get }) => {
        return get(state)
      },
      { isSame: () => true },
    )
    renderHookWithCount(() => useStateValue(computed))

    act(() => {
      state.set((old) => ({ ...old, count: old.count + 1 }))
    })

    expect(await computed.get()).toStrictEqual({ count: 0, someOtherValue: 0 })
  })
  it('should create computed state and block update (re-render) via isSame in react', () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(
      ({ get }) => {
        return get(state)
      },
      { isSame: () => true },
    )
    const { result } = renderHookWithCount(() => useStateValue(computed))

    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })

    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.set((old) => ({ ...old, someOtherValue: 1 }))
    })

    expect(result.current.renderCount).toBe(1)
  })

  it('should create computed state and block update (re-render) via isSame in selector in react', () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(({ get }) => {
      return get(
        state,
        (value) => value,
        () => true,
      )
    })
    const { result } = renderHookWithCount(() => useStateValue(computed))

    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })

    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.set((old) => ({ ...old, someOtherValue: 1 }))
    })

    expect(result.current.renderCount).toBe(1)
  })
  it('should create computed state and block update (re-render) via selector in react', () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(({ get }) => {
      return get(state, (value) => value.someOtherValue)
    })
    const { result } = renderHookWithCount(() => useStateValue(computed))
    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })

    expect(result.current.renderCount).toBe(1)
  })

  it('should create computed state and block update (re-render) via selector in hook in react', () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(({ get }) => {
      return get(state)
    })
    const { result } = renderHookWithCount(() => useStateValue(computed, (value) => value.someOtherValue))
    expect(result.current.renderCount).toBe(1)
    act(() => {
      state.set((old) => ({ ...old, count: 1 }))
    })

    expect(result.current.renderCount).toBe(1)
  })
  it('should create async computed state and create update chain - so re-renders should be minimal', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(state)
    })
    const nestedComputed = createComputed(async ({ get }) => {
      await awaiter(waitTime)
      return get(computed, (value) => value)
    })
    const { result } = renderHookWithCount(() => useStateValue(nestedComputed))

    await act(async () => {
      await awaiter(waitTime * 4)
    })

    await act(async () => {
      // here create 100 value updates - but it should wait for the first update to finish - because it returns promise.
      for (let index = 0; index < 100; index++) {
        await awaiter(waitTime / 2)
        state.set((old) => ({ ...old, count: old.count + 1 }))
      }
    })

    await act(async () => {
      await awaiter(waitTime * 6)
    })
    // so re-renders are minimal - just 3 times
    // 1. was initial before `set`
    // 2. when parent start resolving promise - start loader - if parent also received new data - it start resolving it again - so child will still wait for it
    // 3. when data are available - it will re-render
    // if the data are sync - it will re-render 101 times. (next test) - 100 set + 1 initial
    expect(result.current.renderCount).toBe(3)
    expect(state.get().count).toBe(100)
    expect(result.current.hook.count).toBe(100)
  })

  it('should create computed state and create update chain - so re-renders should be minimal', async () => {
    const state = createState({ count: 0, someOtherValue: 0 })
    const computed = createComputed(({ get }) => {
      return get(state)
    })
    const nestedComputed = createComputed(({ get }) => {
      return get(computed, (value) => value)
    })
    const { result } = renderHookWithCount(() => useStateValue(nestedComputed))

    await act(async () => {
      // here create 100 value updates - but it should wait for the first update to finish - because it returns promise.
      for (let index = 0; index < 100; index++) {
        await awaiter(waitTime / 2)
        state.set((old) => ({ ...old, count: old.count + 1 }))
      }
    })
    expect(result.current.renderCount).toBe(101)
    expect(state.get().count).toBe(100)
    expect(result.current.hook.count).toBe(100)
  })
})
