//var crypto = require('crypto');
//
//var sha = function (num) {
//  function secureDigest (salt, digest, password, pepper) {
//    return crypto
//      .createHash('sha' + num) // or .createHmac('sha' + num, salt)
//      .update('--' + Array.prototype..join.call(arguments, '--') + '--')
//      .digest('hex');
//  }
//
//  return {
//    digest: function (password, stretches, salt, pepper) {
//      var digest = pepper;
//      while (stretches--) {
//        digest = secureDigest(salt, digest, password, pepper);
//      }
//      return digest;
//    }
//  };
//};
//
//var sha512 = sha(512);
//
//var sha1 = sha(1);

var bcrypt = require('bcrypt')
  , authenticate;

exports = module.exports = function (schema, opts) {
  schema.add({
      login: String
    , salt: String
    , hash: String
  });

  schema.virtual('password').get( function () {
    return this._password;
  }).set( function (password) {
    this._password = password;
    var salt = this.salt = bcrypt.gen_salt_sync(10);
    this.hash = bcrypt.encrypt_sync(password, salt);
  });

  schema.method('authenticate', function (password, callback) {
    bcrypt.compare(password, this.hash, callback);
  });


  schema.static('authenticate', exports.authenticate);
};

exports.authenticate = function (login, password, callback) {
  // TODO This will break if we change everyauth's
  //      configurable loginName
  this.findOne({login: login}, function (err, user) {
    if (err) return callback(err);
    user.authenticate(password, function (err, didSucceed) {
      if (err) return callback(err);
      if (didSucceed) return callback(null, user);
      return callback(null, null);
    });
  });
};
