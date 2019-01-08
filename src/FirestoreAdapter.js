'use strict'

const { DatabaseAdapter } = require('@gfa/core/adapters/DatabaseAdapter')
const createFirestoreInstance = require('../config/firestore')

// const { FieldPath } = require('@google-cloud/firestore')

// const INVALID_METHOD = new Error('INVALID_METHOD')

class FirestoreAdapter extends DatabaseAdapter {
  constructor (opts) {
    super(opts)
    this.customId = true
    var options = opts || {}
    var firestoreOpts = {}
    if (options.projectId) {
      firestoreOpts.projectId = options.projectId
    }
    this.firestore = createFirestoreInstance(firestoreOpts)
  }

  query (req, res, kind, conditions, callback) {
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
    query.get().then(querySnapshot => {
      var results = []
      querySnapshot.forEach(documentSnapshot => {
        var data = documentSnapshot.data()
        data.id = documentSnapshot.id
        results.push(data)
      })
      callback(null, req, res, results)
    })
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
