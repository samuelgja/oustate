import { createState, useStateValue } from '../../lib'

const counterState = createState(0)

export const CounterExample = () => {
  const count = useStateValue(counterState)
  return <button onClick={() => counterState.setState(count + 1)}>Increase Count {count}</button>
}
