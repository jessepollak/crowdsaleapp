# Blockchain MyWallet Module

## Opening a wallet

An instance of a wallet needs to be initialized before it can be used:

```
var myWallet = new blockchain.MyWallet(identifier, password [, secondPassword]);
```

The second password is optional. This setting can be turned on or off in your Blockchain wallet's account settings.  
The MyWallet class supports method chaining.

### Response objects

The data parameter passed to callback functions will be either a Payment Response Object or an Address Object. Each method specifies which one it will respond with, given that no error occurs.

Payment Response Object Properties:

* **message**: message confirming the transaction (*string*)
* **tx_hash**: the hash of the transaction (*string*)
* **notice**: notice, not always returned (*string*)

Address Object Properties:

* **address**: the address name (*string*)
* **balance**: the address balance in satoshi (*number*)
* **label**: the address label (*string* or *null*)
* **total_received**: the total satoshi ever received by the address (*number*)

## Methods

### Send Bitcoin

Usage:

```
myWallet.send(options, callback);
```

Sends bitcoin from the wallet to a given address.  
Responds with a Payment Response Object.

Options:

* **to**: recipient address (*string*, required)
* **amount**: amount to send *in satoshi*, unless **inBTC** is set to **true** (*number*, required)
* **inBTC**: if set to true, amounts will be in BTC and *not* satoshis (*boolean*, optional, defaults to **false**)
* **from**: send from a specific Bitcoin address (*string*, optional)
* **fee**: transaction fee value *in satoshi*, unless **inBTC** is set to **true** (*number*, optional, defaults to 0.0001btc)
* **note**: public note to include with transaction (*string*, optional, transactions must be > 0.005btc)

### Send to multiple addresses

Usage:

```
myWallet.sendMany([options,] recipients, callback);
```

Sends bitcoin to multiple addresses.  
Responds with a Payment Response Object.

Parameters:

* **options**: *object* containing options (optional, more below)
* **recipients**: *object* with properties/values in the format: "receivingAddress":amount (required)

Options (optional):

* **inBTC**: if set to true, amounts will be in BTC and *not* satoshis (*boolean*, defaults to **false**)
* **from**: send from a specific Bitcoin address (*string*)
* **fee**: transaction fee value *in satoshi* (*number*, defaults to 0.0001btc)
* **note**: public note to include with transaction (*string*, transactions must be > 0.005btc)

### Get wallet balance

Usage:

```
myWallet.getBalance([inBTC,] callback);
```

Responds with the entire balance of a wallet, as a number, *in satoshi*.

Parameters:

* **inBTC**: if set to true, the amount returned will be denoted in BTC rather than satoshi (*boolean*, defaults to **false**)

### List wallet addresses

Usage:

```
myWallet.listAddresses(callback);
```

Responds with an object that has an **addresses** property. This property is an **array** of Address Objects.

### Get address

Usage:

```
myWallet.getAddress(address, [confirmations,] callback);
```

Responds with an address object of the specified address.

Parameters:

* **address**: the name of the address (*string*, required)
* **confirmations**: minimum number of confirmations to check for (*number*, optional, defaults to 6)

### Create new address

Usage:

```
myWallet.newAddress([label,] callback);
```

Creates a new address.  
Responds with a partial Address Object (contains just the **address** property, also contains the **label** property if a label parameter was passed).

Parameters:

* **label**: automatically set the label of the new address (*string*, optional)

### Archive address

Usage:

```
myWallet.archiveAddress(address, callback);
```

Archives a specific address.  
Responds with an object that has the property **archived**, which is set to the name of the archived address (*string*).

Parameters:

* **address**: the name of the address to archive (*string*, required)

### Unarchive address

Usage:

```
myWallet.unarchiveAddress(address, callback);
```

Unarchives a specific address.  
Responds with an object that has the property **active**, which is set to the name of the unarchived address (*string*).

Parameters:

* **address**: the name of the address to unarchive (*string*, required)

### Consolidating addresses

Usage:

```
myWallet.consolidate([days,] callback);
```

Consolidates addresses that have not received transactions recently into a single new address, which is automatically added to the wallet.  
Responds with an object that has the property **consolidated**, which is set to an array of the names of all addresses that were consolidated (*string*).

Parameters:

* **days**: addresses which have not received any transactions in at least this many days will be consolidated (*number*, optional, defaults to 60)
