# Blockchain Push Transaction Module

Importing from `blockchain`:

```
var pushtx = blockchain.pushtx;
```

## Methods

### pushtx

Usage:

```
pushtx.pushtx(transaction, [apiCode,] callback);
```

Manually broadcasts a transaction over the bitcoin network.

Parameters:

* **transaction**: raw transaction in *hex* format (*string*, required)
* **apiCode**: api code if you have one (*string*, optional)
* **callback**: will not return any data, but will respond with an error if an exception occurs (*function*)