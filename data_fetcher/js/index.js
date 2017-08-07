const express = require('express')
const elasticsearch = require('elasticsearch')
const fetch = require('node-fetch')

// Constants
const PORT = 8000
const HOST = '0.0.0.0'
const COIN_PRICE_FETCH_INTERVAL_SIZE = 60000

// App
const app = express()

// ES Client
const esClient = elasticsearch.Client({
  host: '0.0.0.0:9200',
  log: 'trace'
})

/**
 * [handleFetchCoinTickersSuccess description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function handleFetchCoinTickersSuccess(body) {
  body = body.RAW
  const baseKeys = Object.keys(body)

  baseKeys.map(baseKey => {
    const targetKeys = Object.keys(body[baseKey])

    targetKeys.map(targetKey => {
      esClient.index({
        index: baseKey.toLowerCase(),
        type: `${baseKey.toLowerCase()}_${targetKey.toLowerCase()}`,
        body: body[baseKey][targetKey]
      })
    })
  })
}

/**
 * [handleFetchCoinTickersFailure description]
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
function handleFetchCoinTickersFailure(error) {
  console.log(error)
}

/**
 * [fetchCoinTickers description]
 * @return {[type]} [description]
 */
function fetchCoinTickers() {
  fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,XRP&tsyms=USD,EUR,GBP')
    .then(res => res.json())
    .then(body => handleFetchCoinTickersSuccess(body))
    .catch(error => handleFetchCoinTickersFailure(error))
}

/**
 * [initCoinTickerFetching description]
 * @return {[type]} [description]
 */
function initCoinTickerFetching() {
  setInterval(() => {
    fetchCoinTickers()
  }, COIN_PRICE_FETCH_INTERVAL_SIZE)
}

initCoinTickerFetching()

app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
