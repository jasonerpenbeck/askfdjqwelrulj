var Datastore = require('nedb')
var db = {
  users: new Datastore({ filename: './db/users.txt', autoload: true }),
  activationCodes: new Datastore({ filename: './db/activationCodes.txt', autoload: true }),
  resetCodes: new Datastore({ filename: './db/resetCodes.txt', autoload: true })
};

module.exports = {
  users: db.users,
  activationCodes: db.activationCodes,
  resetCodes: db.resetCodes
};