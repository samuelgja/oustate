import { renderHook } from '@testing-library/react-hooks'
import { useRef } from 'react'

export const renderHookWithCount = <T,>(hook: () => T) =>
  renderHook(() => {
    const countRef = useRef(0)
    countRef.current++
    return { renderCount: countRef.current, hook: hook() }
  })
