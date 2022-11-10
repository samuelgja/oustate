### Oustate

[![Build](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml) [![Code quality check](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/oustate?label=Bundle%20size)](https://bundlephobia.com/result?p=oustate)

Another small, fast but robust ☝️ **React state management library** with aim 🎯 on simplicity and scalability in real world scenarios.

Still experimental / beta. **Do not use it in productions yet!** 👻

Based on React [hooks](https://reactjs.org/docs/hooks-reference.html) api. Inspired by [recoil](https://recoiljs.org/) and [zustand](https://github.com/pmndrs/zustand/blob/main/readme.md) while try to achieve the best from these two worlds.

Solving problems like the dreaded [zombie child problem](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children), [react concurrency](https://reactjs.org/blog/2022/03/29/react-v18.html) and [context loss](https://github.com/facebook/react/issues/13332) between mixed renderers with focus on **re-renders reduction**.

---

#### Install

```bash
yarn add oustate  # or npm i oustate
```

[babel-plugin](####api)

---

#### Quick Start

Simple state example
[live demo](https://codesandbox.io/s/oustate-example-kj2ubq?file=/src/App.tsx)

```typescript
import { createState, useStateValue } from 'oustate'

const userState = createState({ username: 'John', age: 30 })

const App = () => {
  const user = useStateValue(userState) // return all the user object
  return (
    <div
      onClick={() =>
        userState.setState((user) => {
          user.age++
          return { ...user }
        })
      }>
      {user.age}
    </div>
  )
}
```

Simple state example with care about re-renders
[live demo](https://codesandbox.io/s/oustate-re-render-count-ggbgoq?file=/src/App.tsx)

```typescript
import { createState, useStateValue } from 'oustate'

const userState = createState({ username: 'John', age: 30 })

const App = () => {
  const userAge = useStateValue(userState, user => user.age) // return only user.age, so this component re-render only if user.age is changed.
    <div
      onClick={() =>
        userState.setState((user) => {
          user.age++
          return { ...user }
        })
      }>
      {userAge}
    </div>
  )
}
```

Simple computed example
[live demo](https://codesandbox.io/s/oustate-computed-ef8ozl?file=/src/App.tsx)

Simple computed async example
[live demo](https://codesandbox.io/s/oustate-async-computed-sl4h55?file=/src/App.tsx)

---

#### API

##### `createState`

creating basic atom state - it can be almost any value - object / atom / ...

**Example:**

```typescript
import { createState } from 'oustate'

const defaultState = 2
const state = createState(defaultState, {
  // options are optional
  isSame: (prev, next) => true,
  onSet(oldValue, setStateCallback) {
    const newValue = setStateCallback()
    console.log(oldValue, newValue)
  },
})

// get state out of react scope
state.getState()

// set new state
state.setState(3)

// use state in react scope
const stateValue = useStateValue(state)
```

##### `createStateFamily`

same as `createState` but instead of returning `AtomState`, it **returns function** where first parameter (key) is unique state identifier and returns `AtomState`

**Example:**

```typescript
import { createStateFamily } from 'oustate'

const defaultState = 2
const state = createStateFamily(defaultState, {
  // options are optional
  isSame: (prev, next) => true,
  onSet(oldValue, setStateCallback) {
    const newValue = setStateCallback()
    console.log(oldValue, newValue)
    return newValue
  },
})

// get state out of react scope
state('some-key').getState()

// set new state
state('some-key').setState(3)

// use state in react scope
const stateValue = useStateValue(state('some-key'))
```

##### `createComputed`

computed state is a state that depends on other states or other computed states. It is recomputed when the states it depends on change.
**It can be also async**

**Example:**

```typescript
import { createState, createComputed } from 'oustate'

const counterState = createState(0)
const userState = createState({ name: 'John', age: 20 })

// creating computed depends on counterState & userState
const counterPlusUserAgeState = createComputed(({ get }) => get(counterState) + get(userState, (user) => user.age))
// get state
await counterPlusUserAgeState.getState()

// react scope
const counterPlusUser = useStateValue(counterPlusUserAgeState)
```

_Note: Keep in mind when using **useStateValue** and **async computed state**, component need to be wrapped into the [Suspense](https://reactjs.org/docs/react-api.html#reactsuspense)! For more control over `computed` loading states use `useLoadableStateValue` instead `useStateValue`_

##### `createComputedFamily`

same as `createComputed`, but instead of returning `ComputedState`, it **returns function** where first parameter (key) is unique state identifier and returns `ComputedState`

**Example:**

```typescript
import { createState, createComputed } from 'oustate'

const counterState = createState(0)
const userState = createState({ name: 'John', age: 20 })

// creating computed depends on counterState & userState
const counterPlusUserAgeState = createComputedFamily(({ get }) => get(counterState) + get(userState, (user) => user.age))
// get state
await counterPlusUserAgeState('key').getState()

// react scope
const counterPlusUser = useStateValue(counterPlusUserAgeState('key'))
```

##### `createSlice`

it's just helper function - slice wrapped around `createComputed`.
There are scenarios when need to slice 1 state in same way in multiple components (`const userAge = useStateValue(userState, user => user.age) `),
instead of writing same logic multiple times in react scope,
`createSlice` helps to bring it to the global scope (`const userAgeState = createSlice(userState, user => user.age) `).

**Example:**

```typescript
import { createState, createSlice } from 'oustate'

const userState = createState({ name: 'John', age: 20 })

const userAgeState = createSlice(userState, (user) => user.age)
// get state
await userAgeState.getState()

// react scope
const counterPlusUser = useStateValue(userAgeState)
```

Passing functions into the state (like setting state) is not recommended.

_Note: State need to be used in **global js context** (🤫 it can be used also in `React` context, but carefully!)_

#### Calling the state in React

After state is created you can easily use it with `useStateValue`, `useLoadableStateValue` or `useCachedStateValue` hooks.

##### `useStateValue`

hook for getting state value - when async computed is used - need wrap component into the suspense.

##### `useLoadableStateValue`

hook for getting state value but with more control over loading state - component don't need to be wrapped into the suspense

##### `useCachedStateValue`

hook for getting state with caching control - it's useful for async computed states - when on first load it went to the suspense, but on second change it will returns loading state + old state

Keep in mind that using selector functions in all hooks **don't need to be memoized!**
[Selectors no longer need to be memoized](https://github.com/reactwg/react-18/discussions/86)

**👋 Welcome back inline functions 👋**

---

#### For lazy persons 🥱😴

`oustate-babel-transform-plugin`

- there is also babel plugin to avoid re-renders without defining areEqual function manually - it will generates compare function automatically.
  _when there is manual compare function already defined in the code - this plugin will ignore it._

for example something like this:

```typescript
import { useStateValue } from 'oustate'

// without defining slice and return just atom value or define compare function manually - component will re-render on each time when any property from userState will change
const { username } = useStateValue(userState)
```

will be automatically converted to something like this:

```typescript
import { useStateValue } from 'oustate'

// function below is automatically generated by oustate-babel-transform-plugin
function isSameCompare(prev, next) {
  if (prev.username !== next.username) {
    return false
  }
  return true
}

const { username } = useStateValue(userState, undefined, isSameCompare) // component only re-render when username is changed.
```

##### install babel plugin:

```bash
yarn add -D oustate-babel-transform-plugin  # or npm i -D oustate-babel-transform-plugin
```

##### using babel plugin

update plugins in your `babel.config.js` or `.babelrc` file

```javascript
module.exports = {
  plugins: ['oustate-babel-transform-plugin'],
}
```

Plugin works only for oustate hooks, when directly access object properties or array properties:

- **ObjectPattern** (`const {some} = useStateValue(state)`)
- **ArrayPattern** (`const [some, value] = useStateValue(state)`)

here are cases which will be not transformed:

```typescript
const someState = useStateValue(state)
const { value } = someState // transform will be ignored because it's not called directly from useStateValue hook.
```

```typescript
const someState = useStateValue(state)
someState.value // transform will be ignored because it's not called directly from useStateValue hook.
```

---

Well `tested`, written in `typescript`.

This library is just playing around with possible solutions how to create react states, so if you can look at the code & give some feedback - positive or negative, I will appreciate it! 🤗
