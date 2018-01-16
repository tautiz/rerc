var express = require('express')
var router = express.Router()
var request = require('request')
var Slack = require('slack-node')
const MongoClient = require('mongodb').MongoClient;

let EURBTC = {}
let BTCEUR = {}

let OLD_EUR = 2600
let EUR = 1000
let OLD_BTC = 0.16902117
let BTC = 0.15846423
let current_time_stamp = Date.now();

apiToken = 'xoxp-Private-Key'
slack = new Slack(apiToken)
slack.api('users.list', function (err, response) {
    console.log(response)
})

const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'rerc';

// Connect using MongoClient
MongoClient.connect(url, function(err, client) {
    // Use the admin database for the operation
    const adminDb = client.db(dbName).admin();
    // List all the available databases
    adminDb.listDatabases(function(err, dbs) {
        console.log(dbs);
        client.close();
    });
});

function makeRequest()
{
    current_time_stamp = Date.now();

    getRate('EUR', 'BTC');
    getRate('EUR', 'ETH');

    getRate('BTC', 'ETH');
    getRate('BTC', 'EUR');

    getRate('ETH', 'BTC');
    getRate('ETH', 'EUR');

    function getRate(from, to){
        var fromTo = from + to;
        request('https://www.revolut.com/api/quote/internal/'+fromTo, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var rateObj = JSON.parse(body);
                MongoClient.connect(url, function (err, client) {
                    const col = client.db(dbName).collection('rates');
                    var insertObj = {};
                    insertObj[fromTo] = rateObj;
                    insertObj['current_time_stamp'] = current_time_stamp;

                    col.insertOne(insertObj, {w: 1}, function (err, result) {
                        console.log(result.ops);
                    });
                });
            }
        })
    }
}

makeRequest();
var minutes = 10;
var miliseconds = minutes * 60 * 1000;
setInterval(makeRequest, miliseconds);
var history = [];

/* GET home page. */
router.get('/', function (req, res, next) {
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
})

function findRatesByTimestamp(array, timestamp)
{
    var element = {};
    for (key in array) {
        var elem = array[key];
        if (elem.current_time_stamp === timestamp) {
            delete elem._id;
            var kk = '';

            if (typeof elem.BTCEUR !== 'undefined') {
                kk = 'BTCEUR';
            } else if(typeof elem.EURBTC !== 'undefined') {
                kk = 'EURBTC';
            } else if(typeof elem.EURETH !== 'undefined') {
                kk = 'EURETH';
            } else if(typeof elem.ETHEUR !== 'undefined') {
                kk = 'ETHEUR';
            } else if(typeof elem.ETHBTC !== 'undefined') {
                kk = 'ETHBTC';
            } else if(typeof elem.BTCETH !== 'undefined') {
                kk = 'BTCETH';
            } else {
                kk = 'error';
            }
            element[kk] = elem[kk];
        }
        element.current_time_stamp = elem.current_time_stamp;
    }
    return element;
}

/* GET home page. */
router.get('/data.json', function (req, res, next) {
    var data = [];
    var duom = [];
    var rates = {};

    MongoClient.connect(url, function(err, client) {
        const col = client.db(dbName).collection('rates');
        col.find({}).toArray(function(err, result) {
            history = result;
        });
    });

    for(key in history) {
        element = history[key];
        if (typeof element.BTCEUR !== 'undefined') {
            var ratio = findRatesByTimestamp(history, element.current_time_stamp);

            var sellEURBTCrate = ratio.BTCEUR.rate;
            var buyEURBTCrate = null;
            if (typeof ratio.EURBTC !== 'undefined') {
                buyEURBTCrate = (1 / ratio.EURBTC.rate);
            }

            data.push([element.current_time_stamp, sellEURBTCrate, buyEURBTCrate]);
        }
    }
    rates['eur'] = data;

    for(key in history) {
        element = history[key];
        if (typeof element.BTCETH !== 'undefined') {
            var ratio2 = findRatesByTimestamp(history, element.current_time_stamp);
            var sellBTCETHrate = ratio2.BTCETH.rate;
            var buyBTCETHrate = null;
            if (typeof ratio2.ETHBTC !== 'undefined') {
                buyBTCETHrate = (1 / ratio2.ETHBTC.rate);
            }

            duom.push([element.current_time_stamp, sellBTCETHrate, buyBTCETHrate]);
        }
    }
    rates['eth'] = duom;

    res.render('data', {json: rates})
})

module.exports = router
