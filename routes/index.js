var express = require('express')
var router = express.Router()
var request = require('request')
var Slack = require('slack-node')
var mongo = require('mongodb');

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

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});


function makeRequest()
{
    current_time_stamp = Date.now();

    request('https://www.revolut.com/api/quote/internal/EURBTC', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            EURBTC = JSON.parse(body)
            console.log(EURBTC.rate)
            slack.api('chat.postMessage', {
                text: 'Current [EURBTC] rate: ' + EURBTC.rate,
                channel: '#general'
            }, function (err, response) {
                console.log(response)
            })
        }
    })

    request('https://www.revolut.com/api/quote/internal/BTCEUR', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            BTCEUR = JSON.parse(body)
            console.log(BTCEUR.rate)
            slack.api('chat.postMessage', {
                text: 'Current [BTCEUR] rate: ' + BTCEUR.rate,
                channel: '#general'
            }, function (err, response) {
                console.log(response)
            })
        }
    })
}

makeRequest();
var minutes = 5;
var miliseconds = minutes * 60 * 1000;
setInterval(makeRequest, miliseconds);

slack.api('chat.postMessage', {
    text: 'hello from nodejs',
    channel: '#general'
}, function (err, response) {
    console.log(response)
})

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express',
        BTCEUR: BTCEUR,
        EURBTC: EURBTC,
        EUR: EUR,
        BTC: BTC,
        current_time_stamp: current_time_stamp,
        OLD_BTC: OLD_BTC
    })
})

module.exports = router
