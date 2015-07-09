var ripple = require('ripple-lib');
var sjcl = ripple.sjcl;
var Seed = ripple.Seed;
var Wallet = require('ripple-wallet-generator')({ sjcl: ripple.sjcl });

module.exports = threshold;

function threshold () {

  var args = Array.prototype.slice.call(arguments);

  // product of secrets
  var sec = args.map(function (curr) {
    return Seed.from_json(curr.secret).get_key(curr.address)._secret._exponent;
  }).reduce(function (prev, curr) {
    return prev.mul(curr);
  });

  // get secret
  var secret_key = new sjcl.ecc.ecdsa.secretKey(sjcl.ecc.curves.k256, sec);

  var seed = new Seed;
  seed._value = new sjcl.bn(secret_key._exponent);
  var secretKey = seed.to_json();

  var wallet = new Wallet(secretKey);

  return { secret: wallet.secret, address: wallet.getAddress().value }

}
