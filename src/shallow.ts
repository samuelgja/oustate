function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map
}

function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set
}

function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value)
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function shallow<T>(valueA: T, valueB: T): boolean {
  if (valueA == valueB) {
    return true
  }
  if (Object.is(valueA, valueB)) {
    return true
  }

  if (typeof valueA !== 'object' || valueA == null || typeof valueB !== 'object' || valueB == null) {
    return false
  }

  if (isMap(valueA) && isMap(valueB)) {
    if (valueA.size !== valueB.size) return false
    for (const [key, value] of valueA) {
      if (!Object.is(value, valueB.get(key))) {
        return false
      }
    }
    return true
  }

  if (isSet(valueA) && isSet(valueB)) {
    if (valueA.size !== valueB.size) return false
    for (const value of valueA) {
      if (!valueB.has(value)) {
        return false
      }
    }
    return true
  }

  if (isArray(valueA) && isArray(valueB)) {
    if (valueA.length !== valueB.length) return false
    for (const [index, element] of valueA.entries()) {
      if (!Object.is(element, valueB[index])) {
        return false
      }
    }
    return true
  }

  const keysA = Object.keys(valueA as Record<string, unknown>)
  const keysB = Object.keys(valueB as Record<string, unknown>)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(valueB, key) ||
      !Object.is((valueA as Record<string, unknown>)[key], (valueB as Record<string, unknown>)[key])
    ) {
      return false
    }
  }
  return true
}
