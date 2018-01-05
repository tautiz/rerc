var express = require('express')
var router = express.Router()
var request = require('request')
var Slack = require('slack-node')
const MongoClient = require('mongodb').MongoClient;

let EURBTC = {}
let BTCEUR = {}

let OLD_EUR = 2600
let EUR = 2077.31
let OLD_BTC = 0.16902117
let BTC = 0.1706694
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

    request('https://www.revolut.com/api/quote/internal/EURBTC', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            EURBTC = JSON.parse(body);
//            console.log(EURBTC.rate);

//            slack.api('chat.postMessage', {
//                text: 'Current [EURBTC] rate: ' + EURBTC.rate,
//                channel: '#general'
//            }, function (err, response) {
//                console.log(response)
//            });

            MongoClient.connect(url, function(err, client) {
                const col = client.db(dbName).collection('rates');
                var myobj = { EURBTC: EURBTC, current_time_stamp: current_time_stamp };
                col.insertOne(myobj, {w:1}, function(err, result) {
                    console.log(result.length);
                });
            });
        }
    })

    request('https://www.revolut.com/api/quote/internal/BTCEUR', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            BTCEUR = JSON.parse(body);
//            console.log(BTCEUR.rate);
//            slack.api('chat.postMessage', {
//                text: 'Current [BTCEUR] rate: ' + BTCEUR.rate,
//                channel: '#general'
//            }, function (err, response) {
//                console.log(response)
//            });

            MongoClient.connect(url, function(err, client) {
                const col = client.db(dbName).collection('rates');
                var myobj = { BTCEUR: BTCEUR, current_time_stamp: current_time_stamp };
                col.insertOne(myobj, {w:1}, function(err, result) {
                    console.log(result.ops);
                });
            });
        }
    })
}

makeRequest();
var minutes = 5;
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
    MongoClient.connect(url, function(err, client) {
        const col = client.db(dbName).collection('rates');
        col.find({}).toArray(function(err, result) {
            history = result;
        });
    });

    for(key in history) {
        element = history[key];
        if (typeof element.BTCEUR !== 'undefined') {
            rates = findRatesByTimestamp(history, element.current_time_stamp);

            sellrate = rates.BTCEUR.rate;
            if (typeof rates.EURBTC === 'undefined') {
                buyrate = null;
            } else {
                buyrate = (1 / rates.EURBTC.rate);
            }

            data.push([element.current_time_stamp, sellrate, buyrate]);
        }
    }
    res.render('data', {json:data})
})

module.exports = router
