# Blockchain CreateWallet Module

## Opening a wallet

An instance of CreateWallet needs to be initialized before it can be used:

```
var createWallet = new blockchain.CreateWallet(password, apiCode [, options]);
```

The CreateWallet class supports method chaining.

Options:

* **privateKey**: a private key to add to the created wallet (*string*)
* **label**: a label to add to the first address in the wallet (*string*)
* **email**: an email address to associate with this wallet (*string*)

## Methods

### Create

Usage:

```
createWallet.create(callback);
```

Creates a wallet from the parameters assigned in the constructor of CreateWallet.  
Responds with a Wallet Object as the callback's data parameter.

Wallet Object Properties:

* **guid**: the auto-generated wallet identifier (*string*)
* **address**: the first auto-generated address (*string*)
* **link**: the url address of the the new wallet (*string*)

### Open

Usage:

```
createWallet.open(callback);
```

Creates a wallet from the parameters assigned in the constructor of CreateWallet.  
Responds with an instance of MyWallet ([docs](../docs/MyWallet.md)) as the callback's data parameter.
