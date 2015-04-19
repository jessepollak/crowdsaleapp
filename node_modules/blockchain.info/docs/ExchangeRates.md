# Blockchain ExchangeRates Module

## Accessing the module

Import the module from ```blockchain```:

```
var exchangeRates = blockchain.exchangeRates;
```

## Methods

### getTicker

Usage:

```
exchangeRates.getTicker([options,] callback);
```

Gets the market price of BTC compared to world currencies.  
Without any options specified, it responds with a JSON object that has currency codes as keys.

Options (optional):

* **currency**: specify which currency or currencies to get data on (*string* or *array*, required when using the **property** option)
* **property**: only get the data on this property (*string*: '15m', 'last', 'buy', 'sell', 'symbol')

### toBTC

Usage:

```
exchangeRates.toBTC(amount, [currency,] callback);
```

Converts an amount of a given currency to BTC.
Responds with a *number*.

Parameters:

* **amount**: the amount to convert (*number*)
* **currency**: the code of the currency to convert from (*string*, optional, defaults to 'USD')
