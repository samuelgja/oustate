const p = { state: { stateX: [0, 1, 2, 3, 4, 5, 6, 7] } }
const n = { state: { stateX: [0, 1, 2, 3, 4, 6, 6, 7] } }
if (p?.state?.stateX?.[5] !== n?.state?.stateX?.[5]) {
  console.log('same')
  return false
}

console.log('ee')
