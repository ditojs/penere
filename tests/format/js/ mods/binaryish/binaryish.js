function isPlainObject(arg) {
  const ctor = arg?.constructor
  return !!arg && (
    ctor && (
      ctor === Object ||
      ctor.name === 'Object'
    ) || !ctor && !isModule(arg)
  )
}

function merge(target, source) {
  if (target && source && target !== source && (
    isArray(target) && isArray(source) ||
    isPlainObject(target) && isPlainObject(source)
  )) {
    // Impl
  }
}

function isNumber(arg) {
  const type = typeof arg
  return (
    type === 'number' ||
    !!arg && type === 'object' && toString.call(arg) === '[object Number]'
  )
}

function isEmpty(arg) {
  return (
    arg == null ||
    isArrayLike(arg) && arg.length === 0 ||
    isObject(arg) && Object.keys(arg).length === 0
  )
}

function binaryConditional1() {
  if (token === '.' || token === '..' && i === 0) {
    // Impl
  }
}

function binaryConditional2() {
  if (
    token === '.' ||
    token === '..' && i === 0
  ) {
    // Impl
  }
}

function isHostname(str) {
  return !!(str && hostnameRegExp.test(str))
}

function isMultipleOf10(value) {
  return (value % 10) === 0
}

function binaryTemplate() {
  return (
    this.isTransient &&
    '<b>Note</b>: the parent still needs to be saved ' +
    'in order to persist this change.'
  )
}

function binaryLargeNumbers() {
  return (
    this.isTransient && (
      11111111111111111111111111111111111111111111111111111111111111111111111 +
      22222222222222222222222222222222222222222222222222222222222222222222222
    )
  )
}

function someSchemaComponent(schema, callback) {
  return (
    forEachSchemaComponent(
      //
      schema,
      (component, name) => (callback(component, name) ? true : undefined)
    ) === true
  )
}

function binaryNesting1() {
  return (
    ['post', 'put', 'patch'].includes(method) && (
      button.getSchemaValue(['resource', 'data']) ||
      button.processedItem
    )
  )
}

function binaryNesting2() {
  return (
    ['post', 'put', 'patch'].includes(method) && (
      // TODO: Use `handleDataSchema()` asynchronously here instead, to
      // offer the same amount of possibilities for data loading.
      button.getSchemaValue(['resource', 'data']) ||
      button.processedItem
    )
  )
}

function math1() {
  return (
    // Reason for 42
    42
  ) * 84 + 2
}

function math2() {
  return (
    42 *
    84 + 2
  )
}

function math3() {
  return (
    42 *
    84 +
    2
  )
}

function math4() {
  return (
    2 +
    42 *
    84
  )
}

function math5() {
  return (
    2 + 42 *
    84
  )
}

function math6() {
  return (
    2 + 42 +
    84
  )
}

function math7() {
  return (
    2 +
    42 + 84
  )
}

function math8() {
  return (
    2 + 42 + 84
  )
}

if (isNumber(+value)) {
  return +value - 1
}

function returnWithTernary1() {
  return !module || testModuleIdentifier(module, coreDependencies)
    ? 'core'
    : 'vendor'
}

function returnWithTernary2() {
  return !module ||
  testModuleIdentifierWithVeryLongFunctionName(module, coreDependencies)
    ? 'core'
    : 'vendor'
}

const middleware =
  middlewares.length > 1 //
    ? compose(middlewares)
    : middlewares[0]

function getLabel(schema, name) {
  return schema
    ? this.getSchemaValue('label', { type: String, schema }) ||
      labelize(name || schema.name)
    : labelize(name) || ''
}

console.info(
  log.length === 0
    ? pico.cyan('Already up to date')
    : pico.green(`Batch ${batch} run: ${log.length} migrations\n`) +
      pico.cyan(log.join('\n'))
)

const err1 = new NotFoundError(
  error || (
    condition1 &&
    condition2()
  ),
)

const err2 = new NotFoundError(
  (
    condition1 &&
    condition2()
  ) || error,
)

this.mode = this.config.mode || (
  condition1 &&
  condition2()
)

this.mode = this.config.mode || this.app.config.test ? 'test' : 'production'

this.mode = this.config.mode || (
  this.app.config.env === 'development'
    ? 'development' //
    : 'production'
)

function test() {
  return (posix ? path.posix : path).join(key[0], key[1])
}

let value = (
  route.controller.modelClass ||
  ctx.app.knex
)

value = (
  ctx.app.knex ||
  route.controller.modelClass
)

const trx = await transaction.start(
  route.controller.modelClass ||
  ctx.app.knex
)

const obj = {
  shouldLoad() {
    return (
      !this.isTransient &&
      !this.isLoading
    )
  }
}

ok = (
  this.isValidated ||
  this.validateAll()
)

this.type ||= (
  data.type || mime.lookup(this.name)
)

this.type ||=
  data.type ||
  mime.lookup(this.name)

this.type ||= (
  data.type ||
  mime.lookup(this.name)
)

this.type ||= (
  data.type ||
  mime.lookup(this.name) ||
  'application/octet-stream'
)

if (data.type || mime.lookup(this.name)) {
}

if (
  data.type || mime.lookup(this.name)
) {
}

if (
  data.type ||
  mime.lookup(this.name)
) {
}

function expressionPathToString(path, start = 0) {
  return (start ? path.slice(start) : path)
    .map(({ relation, alias, modify }) => {
      const expr = alias ? `${relation} as ${alias}` : relation;
      return modify.length > 0 ? `${expr}(${modify.join(", ")})` : expr;
    })
    .join(".");
}

const required = {
  validate: (value, settings, { password }) => (
    (value != null && value !== '') ||
    (password && value === undefined)
  ),
  validate2: value => value && true,
  message: 'is required',
  nullish: true
}

merge({
  submit: !this.isMutating && {
    type: 'submit'
  }
})

const submit1 = (
  !this.isMutating &&
  { type: 'submit' }
)

const submit2 = (
  !this.isMutating &&
  {
    type: 'submit'
  }
)

const submit3 = !this.isMutating && {
  type: 'submit'
}

const conditions1 = (
  hello() &&
  world() ||
  (whatever() && something()) ||
  somethingElse()
)

const conditions2 = (
  hello() &&
  world() ||
  (
  whatever() && something()) ||
  somethingElse()
)

const conditions3 = (
  hello() &&
  world() ||
  (
    whatever() &&
    something()
  ) ||
  somethingElse()
)

const user = (api.user = getResource(api.user, { type: 'member' }) || {})

const users1 = (api.users = getResource(api.users, {
  type: 'collection'
}) || {})

const users2 = (api.users = (
  getResource(api.users, {
    type: 'collection'
  }) || {}
))

const users3 = (
  api.users = getResource(api.users, {
    type: 'collection'
  }) || {}
)

const users4 = api.users = getResource(api.users, {
  type: 'collection'
}) || ''

const users5 = api.users = getResource(api.users, {
  type: 'collection'
}) || ""

const users6 = api.users = getResource(api.users, {
  type: 'collection'
}) || ``

const data1 = this.handleDataSchema(this.schema.options, 'options', {
  resolveCounter: 1
}) ?? []

const data2 = (
  this.handleDataSchema(this.schema.options, 'options', {
    resolveCounter: 1
  }) ?? []
)

const data3 = (
  this.handleDataSchema(this.schema.options, 'options', {
    resolveCounter: 1
  }) ??
  []
)

const data4 = (
  this.handleDataSchema(this.schema.options, 'options', {
    resolveCounter: 1
  }) ??
  ''
)

const data5 = (
  this.handleDataSchema(this.schema.options, 'options', {
    resolveCounter: 1
  }) ??
  ``
)
const cacheKey = loadCache && `${
  // Bla
  options.method || 'get'} ${
  // Bla
  options.url}`

const cacheParent1 = cache && {
  global: this.appState,
  local: this.dataComponent
}

const cacheParent2 = cache && {
  global: this.appState,
  local: this.dataComponent
}[cache]

const cacheValue1 = cache && [1, 2, 3][cache]

const cacheValue2 = cache && [
  //
  1, 2, 3
][cache]

const inlineTemplate1 = truthy && `a very long template literal that doens't break before the end of the line`

const inlineTemplate2 = truthy && 'a very long template literal that doens\'t break before the end of the line'

const inlineTemplate3 = (
  truthy &&
  `a very long template literal that doens't break before the end of the line`
)

const inlineTemplate4 = (
  truthy &&
  'a very long template literal that doens\'t break before the end of the line'
)

const check1 = (check + 10) === 0
const check2 = (check % 10) === 0
const perTick = difference / duration * 10
const elapsed = startTime && (Date.now() - startTime > 250)

function ternary1() {
  return !file.upload || file.upload.success
    ? this.getSchemaValue('thumbnailUrl', {
        type: 'String',
        default: null,
        context: this.getFileContext(file, index)
      }) || file.type.startsWith('image/') && file.url
    : null
}

function ternary2() {
  return !module || testModuleIdentifier(module, coreDependencies)
    ? 'core'
    : 'vendor'
}

function ternary3() {
  return !module ||
  testModuleIdentifier(module, coreDependencies)
    ? 'core'
    : 'vendor'
}

if (
  splice &&
  (from === undefined ||
  isArray(from) || isPlainObject(from))
) {
}

input.value = (
  value.slice(0, pos) +
  ((value[pos - 1] ?? '') + '00') +
  value.slice(pos + 1)
)
