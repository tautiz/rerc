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

apiToken = 'xoxp-293583170194-293724356261-293065599729-7f1816b11bfd496475b97af3cfadd9fb'
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
            console.log(EURBTC.rate);
            slack.api('chat.postMessage', {
                text: 'Current [EURBTC] rate: ' + EURBTC.rate,
                channel: '#general'
            }, function (err, response) {
                console.log(response)
            });

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
            console.log(BTCEUR.rate);
            slack.api('chat.postMessage', {
                text: 'Current [BTCEUR] rate: ' + BTCEUR.rate,
                channel: '#general'
            }, function (err, response) {
                console.log(response)
            });

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

module.exports = router
