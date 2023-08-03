# Penere

A code formatter based on [Prettier](https://prettier.io), but designed to be less opinionated and a bit more expressive.

## Intro

Just like [Prettier](https://prettier.io) from which it was forked, Penere is a somewhat opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

### Input

<!-- prettier-ignore -->
```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

### Output

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne(),
);
```

Penere can be run [in your editor](https://prettier.io/docs/en/editors.html) on-save, in a [pre-commit hook](https://prettier.io/docs/en/precommit.html), or in [CI environments](https://prettier.io/docs/en/cli.html#list-different) to ensure your codebase has a consistent style without devs ever having to post a nit-picky comment on a code review ever again!

---

**[Documentation](https://prettier.io/docs/en/)**

<!-- prettier-ignore -->
[Install](https://prettier.io/docs/en/install.html) ·
[Options](https://prettier.io/docs/en/options.html) ·
[CLI](https://prettier.io/docs/en/cli.html) ·
[API](https://prettier.io/docs/en/api.html)

**[Playground](https://prettier.io/playground/)**

---

## Badge

Show the world you're using _Penere_ → [![code style: penere](https://img.shields.io/badge/code_style-penere-ffaa00.svg?style=flat-square)](https://github.com/ditojs/penere)

```md
[![code style: penere](https://img.shields.io/badge/code_style-penere-ffaa00.svg?style=flat-square)](https://github.com/ditojs/penere)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
