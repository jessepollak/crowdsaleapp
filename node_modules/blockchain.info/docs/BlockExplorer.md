# Blockchain Block Explorer Module

Used to get data from the blockchain.
To use, first import the module from `blockchain`:

```
var blockexplorer = blockchain.blockexplorer;
```

## Methods

### getBlock

Usage:

```
blockexplorer.getBlock(blockId, [apiCode,] callback);
```

Get a single block based on a block index or hash. Returns a `Block` object.

### getTx

Usage:

```
blockexplorer.getTx(txId, [apiCode,] callback);
```

Get a single transaction based on a transaction index or hash. Returns a `Transaction` object.

### getBlockHeight

Usage:

```
blockexplorer.getBlockHeight(height, [apiCode,] callback);
```

Get an array of blocks at the specified height. Returns an array of `Block` objects.

### getAddress

Usage:

```
blockexplorer.getAddress([options,] address, callback);
```

Get a single address and its transactions. Returns an `Address` object.

Options (optional):

* **limit**: the number of transactions to limit the response to (*number*)
* **offset**: skip the first n transactions (*number*)
* **apiCode**: api code (*string*)

### getMultiAddress

Usage:

```
blockexplorer.getMultiAddress(addresses, [apiCode,] callback);
```

Get information on multiple addresses.

Parameters:

* **addresses**: *array* of addresses or an xPub (extended public key) *string*
* **apiCode**: API code (*string*, optional)

### getUnspentOutputs

Usage:

```
blockexplorer.getUnspentOutputs(address, [apiCode,] callback);
```

Get an array of unspent outputs for an address. Returns an *array* of `UnspentOutput` objects.

### getLatestBlock

Usage:

```
blockexplorer.getLatestBlock([apiCode,] callback);
```

Get the latest block on the main chain. Returns a `LatestBlock` object.

### getUnconfirmedTx

Usage:

```
blockexplorer.getUncomfirmedTx([apiCode,] callback);
```

Get a list of currently unconfirmed transactions. Returns an array of `Transaction` objects.

### getBlocks

Usage:

```
blockexplorer.getBlocks(options, callback);
```

Get a list of blocks for a specific day or mining pool. Returns an array of `SimpleBlock` objects.

Options:

* **pool**: name of the pool to get blocks from (*string*, required)
* **time**: specific day to get blocks from (*number* in milliseconds, optional)
* **apiCode**: api code (*string*, optional)

### getInventoryData

Usage:

```
blockexplorer.getInventoryData(hash, [apiCode,] callback);
```

Get inventory data for recent blocks and addresses (up to 1 hour old). Returns an `InventoryData` object.

## Response Object Properties

A description of each of the objects that may be passed into the callback's `data` parameter when one of the above functions is called.

### Block Object

* **hash**: *string*
* **version**: *number*
* **previous_block**: *string*
* **merkle_root**: *string*
* **time**: *number*
* **bits**: *number*
* **fee**: *number*
* **nonce**: *number*
* **t_tx**: *number*
* **size**: *number*
* **block_index**: *number*
* **main_chain**: *boolean*
* **height**: *number*
* **received_time**: *number*
* **relayed_by**: *string*
* **transactions**: *array* of `Transaction` objects

### Transaction Object

* **double_spend**: *boolean*
* **block_height**: *number*
* **time**: *number*
* **relayed_by**: *string*
* **hash**: *string*
* **tx_index**: *number*
* **version**: *number*
* **size**: *number*
* **inputs**: *array* of `Input` objects
* **outputs**: *array* of `Output` objects

### Input Object

* **n**: *number*
* **value**: *number*
* **address**: *string*
* **tx_index**: *number*
* **type**: *number*
* **script**: *string*
* **script_sig**: *string*
* **sequence**: *number*

### Output Object

* **n**: *number*
* **value**: *number*
* **address**: *string*
* **tx_index**: *number*
* **script**: *string*
* **spent**: *number*

### Address Object

* **hash160**: *string*
* **address**: *string*
* **n_tx**: *number*
* **total_received**: *number*
* **total_sent**: *number*
* **final_balance**: *number*
* **transactions**: *array* of `Transaction` objects

### UnspentOutput Object

* **tx_hash**: *string*
* **tx_index**: *number*
* **tx_output_n**: *number*
* **script**: *string*
* **value**: *number*
* **value_hex**: *string*
* **confirmations*: *number*

### LatestBlock Object

* **hash**: *string*
* **time**: *number*
* **block_index**: *number*
* **height**: *number*
* **tx_indexes**: *array* of tx indices (*number*)

### SimpleBlock Object

* **height**: *number*
* **hash**: *string*
* **time**: *number*
* **main_chain**: *boolean*

### InventoryData Object

* **hash**: *string*
* **type**: *string*
* **initial_time**: *number*
* **initial_ip**: *string*
* **nconnected**: *number*
* **relayed_count**: *number*
* **relayed_percent**: *number*