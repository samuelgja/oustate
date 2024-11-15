
# Oustate

[![Build](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml)
[![Code quality check](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/oustate?label=Bundle%20size)](https://bundlephobia.com/result?p=oustate)

**Oustate** is a small, fast, and robust React state management library focused on simplicity and scalability for real-world scenarios. It leverages React hooks and provides an intuitive API.

## Installation

```bash
bun add oustate
# or
yarn add oustate
# or
npm install oustate
```

## Quick Start

```typescript
import { state } from 'oustate'

const useCounter = create(0)

function Counter() {
  const counter = useMyState()
  return <div onClick={() => useCounter.setState((prev) => prev + 1)}>{counter}</div>
}
```

### Selecting parts of the state globally
```tsx
import { state } from 'oustate'

const useUser = create({ name: 'John', age: 30 })

const useName = useUser.select((user) => user.name)
const useAge = useUser.select((user) => user.age)

function Counter() {
  const name = useName()
  return <div onClick={() => useUser.setState((prev) => ({ ...prev, name: 'Jane' }))}>{counter}</div>
}
```

### Or lazy
```typescript
import { state } from 'oustate';
// getter function, it'a lazy state initialization, loaded only when it's accessed
const useCounter = create(() => 0); 

function Counter() {
  const counter = useCounter();
  return (
    <div onClick={() => useCounter.setState((prev) => prev + 1)}>
      {counter}
    </div>
  );
}
```


### Or merge two states
```typescript
import { state } from 'oustate';
// getter function, it'a lazy state initialization, loaded only when it's accessed
const useName = create(() => 'John');
const useAge = create(() => 30);

const useUser = useName.merge(useAge, (name, age) => ({ name, age }));

function Counter() {
  const {name, age} = useUser();
  return (
    <div onClick={() => useName.setState((prev) => 'Jane')}>
      {counter}
    </div>
  );
}
```


### Promise based state and lifecycle management working with React Suspense
This methods are useful for handling async data fetching and lazy loading via React Suspense.

#### Immediate Promise resolution
```typescript
import { state } from 'oustate';
 // state will try to resolve the promise immediately, can hit the suspense boundary
const counterState = create(Promise.resolve(0));

function Counter() {
  const counter = counterState();
  return (
    <div onClick={() => counterState.setState((prev) => prev + 1)}>
      {counter}
    </div>
  );
}
```

#### Lazy Promise resolution
```typescript
import { state } from 'oustate';
// state will lazy resolve the promise on first access, this will hit the suspense boundary if the first access is from component and via `counterState.getState()` method
const counterState = create(() => Promise.resolve(0)); 

function Counter() {
  const counter = counterState();
  return (
    <div onClick={() => counterState.setState((prev) => prev + 1)}>
      {counter}
    </div>
  );
}
```


## API Reference

### `create`

Creates a basic atom state.

```typescript
function create<T>(defaultState: T, options?: StateOptions<T>): StateSetter<T>;
```

**Example:**

```typescript
const userState = create({ name: 'John', age: 30 });
```

### `select`

Selects a slice of an existing state directly or via a selector function.

```typescript
// userState is ready to use as hook, so you can name it with `use` prefix
const userState = create({ name: 'John', age: 30 });
// Direct selection outside the component, is useful for accessing the slices of the state in multiple components
const userAgeState = userState.select((user) => user.age);

// Selection via selector in hook function
const userNameState = select(userState, (user) => user.name);
```

```typescript
function select<T, S>(state: StateGetter<T>, selector: (value: T) => S, isEqual?: IsEqual<S>): StateGetter<S>;
```

**Example:**

```typescript
const userAgeState = select(userState, (user) => user.age);
```



### Access from outside the component
:warning: Avoid using this method for state management in [React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md), especially in Next.js 13+. It may cause unexpected behavior or privacy concerns.
```typescript
const userState = create({ name: 'John', age: 30 });
const user = userState.getState();
```
---

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

Oustate is [MIT licensed](LICENSE).
