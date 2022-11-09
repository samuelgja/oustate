import { ComputedState, IsSame, StateAll, StateInternal } from '../types/types'
import { createComputed } from './create-computed'

/**
 * Slice state is just helper around `createState` to slice some state outer of react scope.
 */
export const createSlice = <T, S>(
  state: StateAll<StateInternal<T>>,
  selector: (value: StateInternal<T>) => S,
  isSame?: IsSame<S>,
): ComputedState<StateInternal<S>> =>
  createComputed(({ get }) => get(state as any, (value) => (value === undefined ? value : selector(value)), isSame))
