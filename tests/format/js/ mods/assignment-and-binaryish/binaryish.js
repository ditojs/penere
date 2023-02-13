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

function binaryInBinaryLeft() {
  return (
    // Reason for 42
    42
  ) * 84 + 2
}
