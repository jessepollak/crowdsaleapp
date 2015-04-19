# Blockchain Statistics Module

This module is for getting recent and past stats on Bitcoin.  
To use, first import the module from `blockchain`:

```
var statistics = blockchain.statistics;
```

## Methods

### get

Usage:

```
statistics.get([options,] callback);
```

Responds with a json *object* containing an overview of many Bitcoin statistics (view an example response [here][stats]), unless the **stat** option is specified (it will then return a *number*).

Options (optional):

* **apiCode**: call the api with your api code if you have one (*string*)
* **stat**: get only one specific stat, rather than the entire json object response (*string*, ex: "n_btc_mined")

### getChartData

Usage:

```
statistics.getChartData(chartType, [domain,] callback);
```

Responds with a json *object* that has a **values** property set to an *array* of chart coordinate objects in the form: {x:<*number*>,y:<*number*>}.

Parameters:

* **chartType**: specifies which chart you want to get (*string*, ex: "total-bitcoin", required)
* **domain**: specifies the range of times to pull chart coordinates from (*array* with two unix timestamp values, ex: [1421000000, 1423000000], optional)



[stats]: https://blockchain.info/api/charts_api