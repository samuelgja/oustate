import { createState, createComputed, useStateValue, createSlice, ComputedState } from '../src'
import { Suspense } from 'react'
import produce from 'immer'
import { awaiter } from './awaiter'
import {} from 'zustand'
const userState = createState(
  {
    samko: 2,
    sae: 10,
    hello: [1, 2, 3],
    samko2: 0,
  },
  {
    onSet: (old, cb) => produce(old, cb),
  },
)

let coiunt = 0

const useComputedState = createComputed(async ({ get, abortSignal }) => {
  // console.log('END')
  const a = get(userState)
  const aaaa = await fetch('https://petstore.swagger.io/v2/swagger.json', { signal: abortSignal })
  //

  return {
    computed1: await aaaa.json(),
    state: a,
  }
})

const useComputedState2 = createComputed(async ({ get, abortSignal }) => {
  const aaa = get(useComputedState) || { fuck: 'me' }

  const b = await fetch('https://petstore.swagger.io/v2/swagger.json', { signal: abortSignal })
  //
  // console.log(aaa)
  console.log('COMPUTE_CALL___END2')
  return aaa
})

const useComputedState3 = createComputed(async ({ get, abortSignal }) => {
  console.log('COMPUTE_CALL___3')
  const aaa = get(useComputedState2)

  const b = await fetch('https://petstore.swagger.io/v2/swagger.json', { signal: abortSignal })
  //
  // console.log(aaa)

  // const mehe = get(testState2, 'KOKOT')
  await awaiter(2000)
  console.log('COMPUTE_CALL___END3')

  return { aaa, b: await b.json() }
})

const useComputedBasic = createComputed(
  ({ get, abortSignal }) => {
    const a = get(userState)

    return a
  },
  { isSame: (a, b) => a === b },
)

const useComputedBasic2 = createComputed(({ get, abortSignal }) => {
  const a = get(useComputedBasic)
  const b = get(useComputedBasic)

  return a
})

const useComputedBasic3 = createComputed(({ get, abortSignal }) => {
  console.log('COMPUTE_CALL___3')
  const omgmamsdasd = get(useComputedBasic2)

  const aa = get(useComputedBasic)

  return { omgmamsdasd, aa }
})

const useComputedBasicCallAsync = createComputed(({ get, abortSignal }) => {
  console.log('COMPUTE_CALL___useComputedBasicCallAsync')
  const a = get(useComputedState)

  const aa = get(useComputedBasic)

  return { a: aa, aa: aa }
})

const useComputedState4 = createComputed(async ({ get, abortSignal, isCanceled }) => {
  // throw {samko:2}
  console.log('COMPUTE_CALL___4')
  // abortSignal?.addEventListener('abort', () => {
  //   console.log('AKKSDASKDKASD')
  //   throw { samko: 2 }
  // })

  const jesus = get(useComputedState3)

  const x = await fetch('https://petstore.swagger.io/v2/swagger.json', { signal: abortSignal })
  // abortSignal?.addEventListener('abort', () => {
  //   console.log('AKKSDASKDKASD')
  //   throw { samko: 2 }
  // })

  // await awaiter(4000)

  // const valuexy = get(useComputedState3)

  // const x = await fetch('https://petstore.swagger.io/v2/swagger.json', {signal:abortSignal})

  // console.log(aaa)

  // const jesus = {}

  console.log(jesus)

  return jesus
})

const useCOmputedFetchSwagger = createComputed<{ samko: number }>(async ({ get, abortSignal }) => {
  const x = await fetch('https://petstore.swagger.io/v2/swagger.json', { signal: abortSignal })
  return { samko: 2 }
})
const useComputedBasicCallAsync2 = createComputed(({ get, abortSignal }) => {
  const a = get(useComputedState4)

  const aa = get(useComputedBasic2)

  return aa
})

const samko2State = createSlice(userState, (value) => value.samko2)

const useComputedBasic3Slice = createSlice(useComputedBasic3, (value) => {
  console.log(value, 'what')

  return value.omgmamsdasd
})
export const App = () => {
  return (
    <div>
      <div
        onClick={async () => {
          const snapshot = await useComputedState4.getState()
          console.log(snapshot)
          console.log('DOME__')
        }}
      >
        GET_INFO
      </div>
      <App1 />
      <App2 />
      <Suspense fallback={'Loading this...'}>
        <App3 />
      </Suspense>
      {/* <Suspense fallback={'Loading this...'}>
        <App3 />
      </Suspense> */}
    </div>
  )
}

const App1 = () => {
  console.log('re-render-1')

  const a = useStateValue(userState)
  const { samko } = a

  console.log(a)

  return (
    <div
      onClick={() =>
        userState.setState((a) => {
          return { ...a, samko: a.samko + 1 }
        })
      }
    >
      Coun SAMKO {samko}
    </div>
  )
}

const App2 = () => {
  console.log('re-render-2')

  const samko = useStateValue(samko2State)

  return <div onClick={() => userState.setState((a) => ({ ...a, samko2: a.samko2 + 1 }))}>Count SAMKO2 {samko}</div>
}

const waitTime = 100

const state = createState({ count: 0, someOtherValue: 0 })
const computed = createComputed(async ({ get }) => {
  await awaiter(waitTime)
  return get(state)
})
const nestedComputed = createComputed(async ({ get }) => {
  await awaiter(waitTime)
  return get(computed, (value) => value.count)
})

const App3 = () => {
  console.log('re-render-3')

  const s = useStateValue(computed)
  // console.log(s)
  // const s = 'w'
  return (
    <div
      onClick={async () => {
        for (let index = 0; index < 100; index++) {
          // await awaiter(waitTime)
          state.setState((old) => ({ ...old, count: old.count + 1 }))
        }
      }}
    >
      Count {JSON.stringify(s)}
    </div>
  )
}
