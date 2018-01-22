let express = require('express')
let router = express.Router()
let request = require('request')
//let Slack = require('slack-node')
const MongoClient = require('mongodb').MongoClient

let EURBTC = {}
let BTCEUR = {}

let OLD_EUR = 2600
let EUR = 1000
let OLD_BTC = 0.16902117
let BTC = 0.16625839
let current_time_stamp = Date.now()

let currencies = ['BTC', 'ETH', 'LTC']
let currenciesToCompareWith = ['EUR']

//apiToken = 'xoxp-Private-Key'
//slack = new Slack(apiToken)
//slack.api('users.list', function (err, response) {
//    console.log(response)
//})

const url = 'mongodb://localhost:27017'
// Database Name
const dbName = 'rerc'

// Connect using MongoClient
MongoClient.connect(url, function (err, client) {
    // Use the admin database for the operation
    const adminDb = client.db(dbName).admin()
    // List all the available databases
    adminDb.listDatabases(function (err, dbs) {
        console.log(dbs)
        client.close()
    })
})

function makeRequest()
{
    current_time_stamp = Date.now()

    for (i in currencies) {
        let currencyA = currencies[i]
        for (j in currenciesToCompareWith) {
            let currencyB = currenciesToCompareWith[j]
            saveRateToDB(currencyA, currencyB)
            saveRateToDB(currencyB, currencyA)
        }
    }
}

function saveRateToDB(from, to)
{
    let fromTo = from + to
    request('https://www.revolut.com/api/quote/internal/' + fromTo, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let rateObj = JSON.parse(body)
            MongoClient.connect(url, function (err, client) {
                const col = client.db(dbName).collection('rates')
                let insertObj = {}
                insertObj[fromTo] = rateObj
                insertObj['current_time_stamp'] = current_time_stamp

                col.insertOne(insertObj, {w: 1}, function (err, result) {
                    console.log(result.ops)
                })
            })
        }
    })
}

makeRequest()
let minutes = 10
let miliseconds = minutes * 60 * 1000
setInterval(makeRequest, miliseconds)
let history = []

/* GET home page. */
router.get('/', function (req, res, next) {

    searchTimeStamp = current_time_stamp - (5 * 60 * 1000)

    let BTCEUR = -1
    let EURBTC = -1

    getRateByTime('BTCEUR', searchTimeStamp, function (BTCEURRate) {
        if (typeof BTCEURRate.BTCEUR !== 'undefined') {
            BTCEUR = BTCEURRate.BTCEUR.rate
            getRateByTime('EURBTC', searchTimeStamp, function (EURBTCRate) {
                if (typeof EURBTCRate.EURBTC !== 'undefined') {
                    EURBTC = EURBTCRate.EURBTC.rate
console.log("Rates",EURBTC, BTCEUR)

                    res.render('index', {
                        title: '[RERC]',
                        BTCEUR: BTCEUR,
                        EURBTC: EURBTC,
                        EUR: EUR,
                        BTC: BTC,
                        current_time_stamp: current_time_stamp,
                        OLD_BTC: OLD_BTC,
                        OLD_EUR: OLD_EUR
                    })
                } else {
                    res.render('index', {
                        title: '[RERC - Missing data]',
                        BTCEUR: 0,
                        EURBTC: 0,
                        EUR: 0,
                        BTC: 0,
                        current_time_stamp: 0,
                        OLD_BTC: 0,
                        OLD_EUR: 0
                    })
                }
            })
        } else {
            res.render('index', {
                title: '[RERC - Missing data]',
                BTCEUR: 0,
                EURBTC: 0,
                EUR: 0,
                BTC: 0,
                current_time_stamp: 0,
                OLD_BTC: 0,
                OLD_EUR: 0
            })
        }
    })
})

function findRatesByTimestamp(array, timestamp)
{
    let element = {}
    for (key in array) {
        let elem = array[key]
        if (elem.current_time_stamp === timestamp) {
            delete elem._id
            let kk = ''

            if (typeof elem.BTCEUR !== 'undefined') {
                kk = 'BTCEUR'
            } else
                if (typeof elem.EURBTC !== 'undefined') {
                    kk = 'EURBTC'
                } else
                    if (typeof elem.EURETH !== 'undefined') {
                        kk = 'EURETH'
                    } else
                        if (typeof elem.ETHEUR !== 'undefined') {
                            kk = 'ETHEUR'
                        } else
                            if (typeof elem.ETHEUR !== 'undefined') {
                                kk = 'ETHEUR'
                            } else
                                if (typeof elem.BTCETH !== 'undefined') {
                                    kk = 'BTCETH'
                                } else
                                    if (typeof elem.LTCEUR !== 'undefined') {
                                        kk = 'LTCEUR'
                                    } else
                                        if (typeof elem.BTCLTC !== 'undefined') {
                                            kk = 'BTCLTC'
                                        } else {
                                            kk = 'error'
                                        }
            element[kk] = elem[kk]
        }
        element.current_time_stamp = elem.current_time_stamp
    }
    return element
}

function getRateByTime(searchRate, timestamp, calback)
{
    let rez = {}
    MongoClient.connect(url, function (err, client) {
        const col = client.db(dbName).collection('rates')
        let query = {}
        query['current_time_stamp'] = {'$gte': timestamp}
        query[searchRate] = {$exists: true}
        rez = col.findOne(query, function (err, document) {
            calback(document)
        })
        client.close()
    })
}

/* GET home page. */
router.get('/data.json', function (req, res, next) {
    let EURBTCdata = [];
    let BTCEURdata = [];
    let rates = {};
    rates['btc']={};

    MongoClient.connect(url, function (err, client) {
        const col = client.db(dbName).collection('rates')
        col.find({}).toArray(function (err, result) {
            history = result
        })
    })

    for (key in history) {
        let element = history[key]
        if (typeof element.EURBTC !== 'undefined') {
            EURBTCdata.push([element.current_time_stamp, (1 / element.EURBTC.rate)])
        }
    }
    rates['btc']['buy'] = EURBTCdata;

    for (key in history) {
        let element = history[key]
        if (typeof element.BTCEUR !== 'undefined') {
            BTCEURdata.push([element.current_time_stamp, element.BTCEUR.rate])
        }
    }
    rates['btc']['sell'] = BTCEURdata

    res.render('data', {json: rates})
})

module.exports = router
