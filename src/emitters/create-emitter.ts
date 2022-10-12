export type EmitterSubscribe<P = undefined> = (listener: (...params: P[]) => void) => () => void
export interface Emitter<T, R = T, P = undefined> {
  subscribe: EmitterSubscribe<P>
  getSnapshot?: () => R
  getServerSnapshot?: undefined | null | (() => R)
  emit: (...params: P[]) => void
  getSize: () => number
}

// T - listener main type
// R - snapshot return type
// P - listener additional params type

export const createEmitter = <T, R = T, P = undefined>(getSnapshot?: () => R): Emitter<T, R, P> => {
  const listeners: Set<(...params: P[]) => void> = new Set()
  return {
    subscribe: (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    emit: (...params) => {
      for (const listener of listeners) {
        listener(...params)
      }
    },
    getSnapshot,
    getServerSnapshot: getSnapshot,
    getSize: () => {
      return listeners.size
    },
  }
}
