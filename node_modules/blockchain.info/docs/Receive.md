# Blockchain Receive Module

## Creating a receiving address

An instance of Receive needs to be initialized before it can be used:

```
var receive = new blockchain.Receive([options,] callbackURL);
```

The Receive class supports method chaining.

Parameters:

* **options**: set optional properties on initialization (*object*)
* **callbackURL**: the url to which the callback should be sent (*string*)

Options (optional):

* **apiCode**: api code, if you have one (*string*)
* **confirmations**: minimum number of confirmations before becoming able to receive callback url (*number*, defaults to 6)

## Methods

### create

Usage:

```
receive.create(address, [parameters,] callback);
```

Creates a new forwarding address.    
Responds with an *object* in the data parameter of the callback.

Parameters:

* **address**: the address that payments will be forwarded to (*string*, required)
* **parameters**: any custom parameters to be returned with the callback url go in here (*object*, optional)

Response Object:

* **fee_percent**: percent of transaction taken as fee (*number*)
* **destination**: destination address (*string*)
* **input_address**: the forwarding address (*string*)
* **callback_url**: the callback url (*string*)

### listen

Usage:

```
receive.listen(server, callback);
```

Parameters:

* **server**: http server (*object*, required)

Listens for when the callback url sends data back to the server. Occurs whenever a transaction to the forwarding address happens.  
Responds with an *object* in the data parameter of the callback.

Response Object:

* **value**: the value of the payment received, in satoshi (*number*)
* **input_address**: the bitcoin address that received the transaction (*string*)
* **confirmations**: the number of confirmations of this transaction (*number*)
* **transaction_hash**: the hash of the transaction (*string*)
* **input_transaction_hash**: the original hash, before forwarding (*string*)
* **destination_address**: the destination bitcoin address (*string*)
* **{Custom Parameter}**: any parameters included in the callback url that have been passed back

### setConfirmations

Usage:

```
receive.setConfirmations(confirmations);
```

Sets the minimum number of confirmations to look for returning callback urls.

Parameters:

* **confirmations**: specify the minimum number of confirmations (*number*, required)