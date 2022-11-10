import { createState, useStateValue } from '../packages/core'
import produce from 'immer'
import { renderHookWithCount } from './utils'
import { act } from '@testing-library/react'

describe('Basic state', () => {
  it('should create a state', () => {
    const state = createState(
      { count: 0 },
      {
        onSet: (old, cb) => produce(old, cb),
      },
    )

    const { result } = renderHookWithCount(() => useStateValue(state, (value) => value.count))

    act(() => {
      // don't need to be wrapped into the new object reference - because of immer
      state.setState((old) => {
        old.count++
        return old
      })
    })
    expect(result.current.hook).toBe(1)
    expect(state).toBeDefined()
  })
})
