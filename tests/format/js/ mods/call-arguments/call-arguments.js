describe.each(['foobar.com', 'www.foobar.com',])(
  'isUrl(%o)',
  str => {
    it('returns true', () => {
      expect(isUrl(str)).toBe(true)
    })
  }
)

const value = format(
  isDate(value) || value == null ? value : new Date(value),
  { locale, date, time }
)

test(foo(), bar())

test(foo(),
bar())

test(
foo(),
bar())

test(
foo(),
bar()
)

test(
foo()
)

expect(
  format(integer, { locale: 'de-DE', date: false, time: true })
)

getResource(api.users, {
  type: 'collection'
}) || {}
