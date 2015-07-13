var ripple = require('ripple-lib');
var thresholdWallet = require('ripple-wallet-threshold');
var Remote = ripple.Remote;
var Transaction = ripple.Transaction;

// import game / player information from server
var game = JSON.parse(process.env.game);
var players = Object.keys(game.players);
var wallets = players.map(function (player) {
  return game.players[player].wallet;
});

// create shared wallet from player wallets
var sharedWallet = thresholdWallet.apply(null, wallets);

var remote = new Remote({
  trace :         false,
  trusted:        true,
  local_signing:  true,
  servers: [
    { host: 's-west.ripple.com', port: 443, secure: true }
  ]
});

remote.setSecret(sharedWallet.address, sharedWallet.secret);

remote.connect(function() {

  var completedTransfers = 0;

  // issue 100 NEWs (some made up currency) to each wallet from the new shared wallet
  for (var i = 0; i < players.length; i++) {
    var login = players[i];
    var player = game.players[login];
    var wallet = player.wallet;

    console.log(wallet);

    remote.setSecret(wallet.address, wallet.secret);

    grantTrust('10000/NEW', wallet, sharedWallet, function (err, res, wallet, sharedWallet) {
      console.log('GRANT TRUST from', wallet.address, 'to', sharedWallet.address, err, res)
      transfer('100/NEW/'+sharedWallet.address, sharedWallet, wallet, function (err, res) {
        console.log('TRANSFER from', sharedWallet.address, 'to', wallet.address, err, res)
        completedTransfers += 1;
        if (completedTransfers === players.length) {
          remote.disconnect();
        }
      })
    });
  }

});

function grantTrust (amount, fromPlayer, toPlayer, cb) {
  var transaction = remote.createTransaction('TrustSet', {
    account: fromPlayer.address,
    limit: amount+'/'+toPlayer.address
  });

  transaction.submit(function (err, res) {
    cb(err, res, fromPlayer, toPlayer);
  });
}

function transfer (amount, fromPlayer, toPlayer, cb) {

  var transaction = remote.createTransaction('Payment', {
    account: fromPlayer.address,
    destination: toPlayer.address,
    amount: amount
  });

  transaction.submit(cb);

}
