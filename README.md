### THIS PROJECT HAS BEEN DISCONTINUED.

Read more [here](https://github.com/pauloddr/gfa-guides/blob/master/README.md).

Original README archived below.

---

# @gfa/firestore-adapter

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
