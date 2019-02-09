'use strict'

const { DatabaseAdapter } = require('@gfa/core/adapters/DatabaseAdapter')
const createFirestoreInstance = require('../config/firestore')

class FirestoreAdapter extends DatabaseAdapter {
  constructor (opts) {
    super(opts)
    this.customId = true
    var options = opts || {}
    var firestoreOpts = {}
    if (options.projectId) {
      firestoreOpts.projectId = options.projectId
    }
    console.log('[FirestoreAdapter]', 'Initializing query cache')
    this.cachedQueries = new Map()
    this.firestore = createFirestoreInstance(firestoreOpts)
  }

  query (req, res, kind, conditions, callback) {
    var cachedQueries = this.cachedQueries
    let cacheKey = JSON.stringify([kind, conditions])
    var cache = this.cachedQueries.get(cacheKey)
    if (cache) {
      console.log('[FirestoreAdapter]', 'Sending cached results for', cacheKey)
      this.queryResult(req, res, cache.snapshot, callback)
      return
    }
    console.log('[FirestoreAdapter]', 'Creating new query', cacheKey)
    cache = { callback }
    cachedQueries.set(cacheKey, cache)
    var query = this.firestore.collection(kind)
    var operator, field, value
    if (conditions) {
      for (var condition of conditions) {
        if (condition[2] === undefined) {
          continue
        }
        field = condition[0]
        value = condition[2]
        if (field === 'id') {
          field = '__name__'
          value = String(value)
        }
        operator = condition[1]
        if (operator === '=') {
          operator = '=='
        }
        query = query.where(field, operator, value)
      }
    }
    var unsubscribe = query.onSnapshot(
      snapshot => {
        console.log('[FirestoreAdapter]', 'Snapshot generated for', cacheKey)
        var cache = cachedQueries.get(cacheKey)
        cache.unsubscribe = unsubscribe
        cache.snapshot = snapshot
        if (cache.callback) {
          console.log('[FirestoreAdapter]', 'Sending query results for the first time for', cacheKey)
          this.queryResult(req, res, snapshot, cache.callback)
          cache.callback = null
        }
      },
      error => {
        console.log('[FirestoreAdapter]', 'Error on snapshot listener for', cacheKey)
        console.log(error)
        cachedQueries.delete(cacheKey)
      }
    )
  }

  queryResult (req, res, snapshot, callback) {
    var results = []
    snapshot.forEach(documentSnapshot => {
      var data = documentSnapshot.data()
      for (var field in data) {
        // Look for Timestamps and convert them to Dates
        if (data[field].constructor.name === 'Timestamp') {
          data[field] = data[field].toDate()
        }
      }
      results.push({
        id: documentSnapshot.id,
        ...data
      })
    })
    callback(null, req, res, results)
  }

  insert (req, res, kind, data, callback) {
    var id = data.id
    delete data.id
    const collection = this.firestore.collection(kind)
    var document
    if (this.customId && id) {
      document = collection.doc(id)
    } else {
      document = collection.doc()
    }
    // TODO: check if document exists
    document.set(data).then(_ => {
      callback(null, req, res, document.id)
    }).catch(err => {
      console.warn(err)
      callback(err, req, res)
    })
  }

  replace (req, res, kind, id, data, callback) {
    const collection = this.firestore.collection(kind)
    var document
    document = collection.doc(id)
    document.set(data, { merge: true }).then(_ => {
      callback(null, req, res)
    }).catch(err => {
      console.warn(err)
      callback(err, req, res)
    })
  }

  delete (req, res, kind, id, callback) {
    if (!kind || !id) {
      callback(new Error('delete: ID required'), req, res)
      return
    }
    var document = this.firestore.collection(kind).doc(id)
    if (!document) {
      console.warn('delete: not found', kind, id)
      callback(null, req, res)
      return
    }
    document.delete().then(() => {
      callback(null, req, res)
    })
  }
}

exports.FirestoreAdapter = FirestoreAdapter
