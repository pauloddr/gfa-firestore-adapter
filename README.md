# @gfa/firestore-adapter

[![Build Status](https://travis-ci.com/pauloddr/gfa-firestore-adapter.svg?branch=master)](https://travis-ci.com/pauloddr/gfa-firestore-adapter)
[![Coverage Status](https://coveralls.io/repos/github/pauloddr/gfa-firestore-adapter/badge.svg?branch=master)](https://coveralls.io/github/pauloddr/gfa-firestore-adapter?branch=master)

[__Google Firestore__](https://github.com/googleapis/nodejs-firestore) adapter for __@gfa/*__ components.

## Development

Tests are run against the official [Firestore Emulator](https://cloud.google.com/sdk/gcloud/reference/beta/emulators/firestore/).

Install the emulator:

```bash
firebase setup:emulators:firestore
```

Start the emulator with:

```bash
firebase serve --only firestore &
```

Then, run `npm test` to test against the running emulator.
