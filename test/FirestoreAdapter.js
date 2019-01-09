'use strict'

const FirestoreAdapter = require('../')
const { behaves } = require('@gfa/core/test/behaviors/DatabaseAdapter')
const { createApp, deleteApp } = require('../config/firestore')

describe('FirestoreAdapter', function () {
  this.timeout(10000)

  before(function () {
    createApp()
    this.adapter = new FirestoreAdapter()
    // Clear all data
    var firestore = this.adapter.firestore
    return firestore.collection('tasks').get().then(tasks => {
      var promises = []
      tasks.forEach(task => {
        promises.push(task.ref.delete())
      })
      return Promise.all(promises).then(() => {
        return firestore.collection('notes').get().then(notes => {
          var promises = []
          notes.forEach(note => {
            promises.push(note.ref.delete())
          })
          return Promise.all(promises)
        })
      })
    })
  })

  after(function () {
    deleteApp()
  })

  behaves.like.a.DatabaseAdapter()
})
