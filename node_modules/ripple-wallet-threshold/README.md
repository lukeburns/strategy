# Threshold Ripple Wallet

Create a wallet from multiple ripple wallets.

## Usage

```
npm install ripple-wallet-threshold
```

```javascript
var threshold = require('ripple-wallet-threshold');
var wallets[ { address: 'rrrrrrr1', secret: 'secret1'}, { address: 'rrrrrrr2', secret: 'secret2' } ];
var thresholdWallet = threshold(wallets[0], wallets[1]); // returns new address and secret
```
