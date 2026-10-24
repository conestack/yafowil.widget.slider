Changes
=======

2.0.1 (unreleased)
------------------

- Fix ``max: 0`` being ignored by ``Slider``. The slider used the default
  maximum of 100 instead, e.g. ``min: -100, max: 0`` resulted in a range from
  -100 to 100.
  [rnix]

- Fix setting a negative value on a slider with a negative ``min``. It failed
  with "Single values in range must be in ascending order".
  [rnix]

- Extend the JS tests to 100 % coverage, all modules including bundles are
  loaded by the tests now.
  [rnix]

- Lint and format the JS code with biome. ``make check`` runs ``biome check``,
  ``make format`` runs ``biome check --write`` (see ``include.mk``). Behavior
  unchanged.
  [rnix]

- JS tooling: Commit ``pnpm-lock.yaml``. Upgrade ``@web/test-runner`` to 1.0
  and run the JS tests headless in Chromium via Playwright, installed in the JS
  CI workflow. Drop the accidental ``install`` dev dependency. Pin patched
  versions of vulnerable transitive dependencies via ``pnpm.overrides``.
  [rnix]

- Modernise the code ruff flags as outdated: ``u''`` prefixes. Behaviour
  unchanged. ``super(Class, self)`` is kept, see ``cone.app``.
  [rnix]

- Sort the imports with ruff (one per line, ``from`` imports first, no
  sections) and format the code with ``ruff format`` (90 characters per line,
  single quotes).
  [rnix]

- Add ``qa.ruff`` domain to Makefile and pin the ruff configuration in
  ``pyproject.toml``, ``make check`` runs ``ruff check``.
  [rnix]

- Drop the Python 2 remnants: ``yafowil.compat`` usage and ``IS_PY2`` branches.
  [rnix]

- Declare ``requires-python = ">=3.10"``.
  [rnix]


2.0.0 (2026-02-03)
------------------

- Refactor package layout to use ``pyproject.toml`` and implicit namespace packages.
  [rnix]

- Introduce ``display_class`` and ``disabled`` widget properties.
  [lenadax]

- Update jQuery to version ``4.0.0-beta.2``.
  [lenadax]

- Implement dark theme for ``Bootstrap5`` dark theme mode.
  [lenadax]

- Use rollup for bundling scss. Use ``make rollup`` to compile js and scss.
  [lenadax]

- Use ``webtestrunner`` instead of ``karma`` for js tests. Use ``make wtr`` to run tests.
  [lenadax]

- Use ``pnpm`` as package manager.
  [lenadax]


2.0a2 (2024-02-12)
------------------

- Add minified css resource.
  [rnix]


2.0a1 (2023-05-15)
------------------

- Add ``webresource`` support.
  [rnix]

- Extend JS by ``slider_on_array_add`` and ``register_array_subscribers``
  functions to enable usage in ``yafowil.widget.array``.
  [lenadax]

- Rewrite of Javascript slider widget. No more jQuery UI.
  [lenadax, rnix]


1.4 (2025-11-03)
----------------

- Pin upper versions of dependencies.
  [lenadax]


1.3.1 (2020-05-30)
------------------

- Fix binding scope in ``bdajax`` binder callback.
  [rnix]


1.3 (2018-07-16)
----------------

- Python 3 compatibility.
  [rnix]

- Convert doctests to unittests.
  [rnix]


1.2 (2017-03-01)
----------------

- Add dedicated CSS for ``plone5`` theme provided by ``yafowil.plone``.
  [rnix, 2016-06-28]

- Use ``yafowil.utils.entry_point`` decorator.
  [rnix, 2016-06-28]


1.1 (2015-01-23)
----------------

- Update jquery UI slider to 1.10.3 and use latest jquery ui boostrap
  styles.
  [rnix, 2014-07-05]


1.0
---

- Make it work
  [rnix]
