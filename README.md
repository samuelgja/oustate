
# Oustate

[![Build](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/build.yml)
[![Code quality check](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgjabel/oustate/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/oustate?label=Bundle%20size)](https://bundlephobia.com/result?p=oustate)

**Oustate** is a small, fast, and robust React state management library focused on simplicity and scalability for real-world scenarios. It leverages React hooks and provides an intuitive API.

## Installation

```bash
bun add oustate
# or
npm install oustate
# or
yarn add oustate
```

## Quick Start

```typescript
import { state } from 'oustate';

const counterState = state(0);

function Counter() {
  const counter = counterState();
  return (
    <div onClick={() => counterState.set((prev) => prev + 1)}>
      {counter}
    </div>
  );
}
```

## API Reference

### `state`

Creates a basic atom state.

```typescript
function state<T>(defaultState: T, options?: StateOptions<T>): StateSetter<T>;
```

**Example:**

```typescript
const userState = state({ name: 'John', age: 30 });
```

### `select`

Selects a slice of an existing state directly or via a selector function.

```typescript
// userState is ready to use as hook, so you can name it with `use` prefix
const userState = state({ name: 'John', age: 30 });
// Direct selection
const userAgeState = userState.select((user) => user.age);

// Selection via selector function
const userNameState = select(userState, (user) => user.name);
```

```typescript
function select<T, S>(state: StateGetter<T>, selector: (value: T) => S, isEqual?: IsEqual<S>): StateGetter<S>;
```

**Example:**

```typescript
const userAgeState = select(userState, (user) => user.age);
```


---

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

Oustate is [MIT licensed](LICENSE).
