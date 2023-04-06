logger.trace(
  { req: ctx.req },
  `${pico.gray('<--')} ${pico.bold(ctx.method)} ${pico.gray(ctx.originalUrl)}`
)

logger.trace(
  { req: ctx.req },
  `${
    pico.gray('<--')
  } ${
    pico.bold(ctx.method)
  } ${
    pico.gray(ctx.originalUrl)
  }`
)

this.logRoute(
  `${
    pico.magenta(method.toUpperCase())
  } ${
    pico.green(this.url)
  }${
    pico.cyan(url.slice(this.url.length))
  } ${
    pico.white(this.describeAuthorize(authorize))
  }`,
  this.level + 1
)

deprecate(
  `@parameters(${
    formatJson(parameters, false)
  }) with parameter schema object is deprecated: Schema object should be passed nested inside an array or object definition.`
)

class RequestError extends Error {
  constructor(response) {
    super(
      `Request failed with status code: ${
        response.status
      } (${
        response.statusText
      })`
    )
    this.response = response
  }
}
