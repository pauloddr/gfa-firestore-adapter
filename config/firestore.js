if (process.env.NODE_ENV === 'test') {
  console.log('Using Firestore/Testing')
  var firebase = require('@firebase/testing')
  var app
  module.exports = function () {
    return app.firestore()
  }
  module.exports.createApp = function () {
    app = firebase.initializeTestApp({ projectId: 'test', auth: { uid: 'mockUser' } })
  }
  module.exports.deleteApp = function () {
    app.delete()
    app = null
  }
} else {
  const Firestore = require('@google-cloud/firestore')
  module.exports = function (opts) {
    return new Firestore(opts)
  }
}
