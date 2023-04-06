const array1 = [1, 2, 3]

const array2 = [
  1, 2, 3
]

const array3 = [
  1, 2, 3, 5, 6, 7, 8
]

const array4 = [
  1,
  2,
  3, 4, 5, 6, 7, 8
]

const array5 = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8
]

const strings1 = ['foo bar', 'Foo bar', 'foo Bar', 'Foo Bar', 'FOO BAR', 'FooBar', 'fooBar']

const strings2 = [
  'foo bar', 'Foo bar', 'foo Bar', 'Foo Bar', 'FOO BAR', 'FooBar', 'fooBar'
]

const strings3 = [
  'foo bar',
  'Foo bar',
  'foo Bar', 'Foo Bar', 'FOO BAR', 'FooBar', 'fooBar'
]

const strings4 = [
  'foo bar',
  'Foo bar',
  'foo Bar',
  'Foo Bar',
  'FOO BAR',
  'FooBar',
  'fooBar'
]

const strings5 = [
  'one', 'two', 'three',
  'four', 'five', 'six',
  'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve'
]

const strings6 = [1, 2, 3,,, 4, 5, 6]

describe.each([
  'foobar.com',
  'www.foobar.com',
])

const source1 = [{ a: 1 }, { b: 2 }]
const source2 = [{ c: 3 }, { d: 4 }]
const expected = [{ a: 1, c: 3 }, { b: 2, d: 4 }]

expect(groupBy(array, value => value[0])).toStrictEqual({
  1: [[1, 'a']],
  2: [[2, 'a'], [2, 'b']]
})

for (const [name,
componentSchema] of Object.entries(components)) {}

for (const [
name, componentSchema] of Object.entries(components)) {}

for (const [
name,
componentSchema] of Object.entries(components)) {}
