import type { Ref, Setter, SetValue } from './types'

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise
}
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}
export function isSetValueFunction<T>(value: SetValue<T>): value is Setter<T> {
  return typeof value === 'function'
}
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
export function isRef<T>(value: unknown): value is Ref<T> {
  return isObject(value) && value.isRef === true
}
