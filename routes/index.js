let express = require('express')
let router = express.Router()
let request = require('request')
let Slack = require('slack-node')
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

    let curencies = ['BTC', 'ETH', 'LTC'];
    let checkWith = ['EUR'];

    for (i in curencies) {
        let currencyA = curencies[i];
        for(j in checkWith) {
            let currencyB = checkWith[j];
            getRate(currencyA, currencyB);
            getRate(currencyB, currencyA);
        }
    }

    function getRate(from, to){
        let fromTo = from + to;
        request('https://www.revolut.com/api/quote/internal/'+fromTo, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let rateObj = JSON.parse(body);
                MongoClient.connect(url, function (err, client) {
                    const col = client.db(dbName).collection('rates');
                    let insertObj = {};
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
let minutes = 10;
let miliseconds = minutes * 60 * 1000;
setInterval(makeRequest, miliseconds);
let history = [];

/* GET home page. */
router.get('/', function (req, res, next) {

    searchTimeStamp = current_time_stamp - (5 * 60 * 1000);

    let BTCEUR = 0;
    let EURBTC = 0;
    let BTCEURRate = getRateByTime('BTCEUR', searchTimeStamp);
    let EURBTCRate = getRateByTime('EURBTC', searchTimeStamp);

    if (typeof BTCEURRate.BTCEUR !== 'undefined') {
        BTCEUR = BTCEURRate.BTCEUR.rate;
    }
    if (typeof EURBTCRate.EURBTC !== 'undefined'){
        EURBTC = EURBTCRate.EURBTC.rate;
    }

console.log(EURBTC, BTCEUR);

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
});

function findRatesByTimestamp(array, timestamp)
{
    let element = {};
    for (key in array) {
        let elem = array[key];
        if (elem.current_time_stamp === timestamp) {
            delete elem._id;
            let kk = '';

            if (typeof elem.BTCEUR !== 'undefined') {
                kk = 'BTCEUR';
            } else if(typeof elem.EURBTC !== 'undefined') {
                kk = 'EURBTC';
            } else if(typeof elem.EURETH !== 'undefined') {
                kk = 'EURETH';
            } else if(typeof elem.ETHEUR !== 'undefined') {
                kk = 'ETHEUR';
            } else if(typeof elem.ETHEUR !== 'undefined') {
                kk = 'ETHEUR';
            } else if(typeof elem.BTCETH !== 'undefined') {
                kk = 'BTCETH';
            } else if(typeof elem.LTCEUR !== 'undefined') {
                kk = 'LTCEUR';
            } else if(typeof elem.BTCLTC !== 'undefined') {
                kk = 'BTCLTC';
            } else {
                kk = 'error';
            }
            element[kk] = elem[kk];
        }
        element.current_time_stamp = elem.current_time_stamp;
    }
    return element;
}
function getRateByTime(searchRate, timestamp)
{
    let rez = {};
    MongoClient.connect(url, function(err, client) {
        const col = client.db(dbName).collection('rates');
        let query = {};
        query["current_time_stamp"] = { "$gte" : timestamp };
        query[searchRate] = { $exists: true };
        rez = col.findOne(query, function(err, document) {
            return document;
        });
        client.close();
    });

console.log("REZ",rez);

    return rez;
}

/* GET home page. */
router.get('/data.json', function (req, res, next) {
    let data = [];
    let duom = [];
    let rates = {};

    MongoClient.connect(url, function(err, client) {
        const col = client.db(dbName).collection('rates');
        col.find({}).toArray(function(err, result) {
            history = result;
        });
    });

    for(key in history) {
        element = history[key];
        if (typeof element.BTCEUR !== 'undefined') {
            let ratio = findRatesByTimestamp(history, element.current_time_stamp);

            let sellEURBTCrate = ratio.BTCEUR.rate;
            let buyEURBTCrate = null;
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
            let ratio2 = findRatesByTimestamp(history, element.current_time_stamp);
            let sellBTCETHrate = ratio2.BTCETH.rate;
            let buyBTCETHrate = null;
            if (typeof ratio2.ETHEUR !== 'undefined') {
                buyBTCETHrate = (1 / ratio2.ETHEUR.rate);
            }

            duom.push([element.current_time_stamp, sellBTCETHrate, buyBTCETHrate]);
        }
    }
    rates['eth'] = duom;

    for(key in history) {
        element = history[key];
        if (typeof element.BTCLTC !== 'undefined') {
            let ratio3 = findRatesByTimestamp(history, element.current_time_stamp);
            let sellBTCLTCrate = ratio3.BTCLTC.rate;
            let buyBTCLTCrate = null;
            if (typeof ratio3.LTCEUR !== 'undefined') {
                buyBTCLTCrate = (1 / ratio3.LTCEUR.rate);
            }

            duom.push([element.current_time_stamp, sellBTCLTCrate, buyBTCLTCrate]);
        }
    }
    rates['ltc'] = duom;

    res.render('data', {json: rates})
})

module.exports = router
