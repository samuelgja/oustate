import { getDatabase, set, ref, onValue } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { createComputed, createState, createSyncState, useStateValue } from '../src'
import { Suspense } from 'react'

initializeApp({ databaseURL: 'https://testdb-5a6b7-default-rtdb.europe-west1.firebasedatabase.app/' })
const userId = 123213
function writeUserDataToDatabase(userId, obj: any) {
  const db = getDatabase()
  set(ref(db, 'users/' + userId), obj)
}

const db = getDatabase()

const starCountRef = ref(db, 'users/' + userId)

const state = createSyncState<{ count: number }>({
  onSet: (newValue) => writeUserDataToDatabase(userId, newValue),
  onSnapshot: (setData) =>
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val()
      console.log(data)
      if (data === null) {
        return
      }

      setData(data)
    }),
  isSame: (prev, next) => prev?.count === next?.count,
})

const stateComputed = createComputed<{ count: string }>(({ get }) => {
  const count = get(state, (value) => value?.count)
  return { count: `${count}-----${count * 2}` }
})

const stateComputed2 = createComputed<{ count: string }>(({ get }) => {
  const count = get(stateComputed)
  return count.count
})

export const App2 = () => {
  const value = useStateValue(stateComputed2)
  return (
    <div onClick={() => state.setState((oldValue) => ({ ...oldValue, count: oldValue.count + 1 }))}>{JSON.stringify(value)}</div>
  )
}

export const App = () => {
  return (
    <Suspense fallback={'Loading...'}>
      <App2 />
    </Suspense>
  )
}
