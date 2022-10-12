import { ComputedState, IsSame, StateAll, StateInternal } from '../types'
import { createComputed } from './create-computed'

export const createSlice = <T, S>(
  state: StateAll<StateInternal<T>>,
  selector: (value: StateInternal<T>) => S,
  isSame?: IsSame<S>,
): ComputedState<StateInternal<S>> =>
  createComputed(({ get }) => get(state as any, (value) => (value === undefined ? value : selector(value)), isSame))
