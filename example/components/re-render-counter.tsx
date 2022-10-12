import React, { useEffect, useRef } from 'react'
interface Props {
  value: number
  onIncrement: () => void
  totalCount: number
  name?: string
  onFinish?: () => void
}
export const ReRenderCounter = ({ totalCount, onIncrement, onFinish, value, name }: Props) => {
  const startTime = useRef(performance.now())
  useEffect(() => {
    console.log(`\nStart ${name} benchmark`)
  }, [])
  useEffect(() => {
    if (value < totalCount) {
      onIncrement()
      return
    }
    onFinish?.()
    console.log(`TOTAL_TIME`, performance.now() - startTime.current)
  })
  return <p>count: {value}</p>
}
