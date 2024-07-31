import { createState, useStateValue } from '../packages/core'
import produce from 'immer'
import { renderHookWithCount } from './utils'
import { act } from '@testing-library/react'

describe('Basic state', () => {
  it('should update state with immer in set function', () => {
    const state = createState(
      { count: 0, nestedValue: { value: 0 } },
      {
        onSet: produce,
      },
    )

    const { result } = renderHookWithCount(() => useStateValue(state, (value) => value))

    act(() => {
      // don't need to be wrapped into the new object reference - because of immer
      state.set((old) => {
        old.count++
        old.nestedValue.value = 100
        return old
      })
    })
    expect(result.current.hook.count).toBe(1)
    expect(result.current.hook.nestedValue.value).toBe(100)
    expect(state).toBeDefined()
  })
  it('should update state with immer in inline', () => {
    const state = createState(
      { count: 0, nestedValue: { value: 0 } },
      {
        onSet: produce,
      },
    )

    const { result } = renderHookWithCount(() => useStateValue(state, (value) => value))

    act(() => {
      // don't need to be wrapped into the new object reference - because of immer
      state.set({ count: 1, nestedValue: { value: 100 } })
    })
    expect(result.current.hook.count).toBe(1)
    expect(result.current.hook.nestedValue.value).toBe(100)
    expect(state).toBeDefined()
  })
})
