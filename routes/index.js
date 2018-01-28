let express = require('express');
let router = express.Router();
let request = require('request');
let fs = require('fs'),
    ini = require('ini');

const MongoClient = require('mongodb').MongoClient;

let EURBTC = {};
let BTCEUR = {};

let OLD_EUR = 2600;
let EUR = 1000;
let OLD_BTC = 0.16902117;
let BTC = 0.16625839;
let current_time_stamp = Date.now();

let currencies = ['BTC', 'ETH', 'LTC'];
let currenciesToCompareWith = ['EUR'];

const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'rerc';

// Connect using MongoClient
MongoClient.connect(url, function (err, client) {
    // Use the admin database for the operation
    const adminDb = client.db(dbName).admin();
    // List all the available databases
    adminDb.listDatabases(function (err, dbs) {
        console.info("LIST OF DB's ", dbs, "\n");
        client.close();
    })
});

function makeRequest() {
    current_time_stamp = Date.now();

    for (i in currencies) {
        let currencyA = currencies[i];
        for (j in currenciesToCompareWith) {
            let currencyB = currenciesToCompareWith[j];
            getAndSaveRateToDB(currencyA, currencyB);
            getAndSaveRateToDB(currencyB, currencyA);
        }
    }
}

function evalExpression(fromTo, rateObj) {
    let config = ini.parse(fs.readFileSync('./params.ini', 'utf-8'));
    let rulesToMonitor = (config.rulesToMonitor.expression).split(" ");
    let ft = rulesToMonitor[0];
    let expressionSymbol = rulesToMonitor[1];
    let value = rulesToMonitor[2];
    let string = '"' + fromTo + '" === "' + ft + '" && ' + rateObj.rate + ' ' + expressionSymbol + ' ' + value;
    let expression = eval(string);
    return expression;
}

function getAndSaveRateToDB(from, to) {
    let fromTo = from + to;
    request('https://www.revolut.com/api/quote/internal/' + fromTo, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let rateObj = JSON.parse(body);
            MongoClient.connect(url, function (err, client) {
                const col = client.db(dbName).collection('rates');
                let insertObj = {};
                insertObj[fromTo] = rateObj;
                insertObj['current_time_stamp'] = current_time_stamp;

                col.insertOne(insertObj, {w: 1}, function (err, result) {
                    console.info("Saved to DB: ", result.ops, "\n");
                })
            });

            if (evalExpression(fromTo, rateObj)) {
                triggerWebHook({"value1": rateObj.rate});
            }
        }
    })
}

makeRequest();
let minutes = 10;
let milliseconds = minutes * 60 * 1000;
setInterval(makeRequest, milliseconds);
let history = [];

function triggerWebHook(data) {
    let config = ini.parse(fs.readFileSync('./params.ini', 'utf-8'));
    let url = config.webhookUrl;
    request.post(url, { json: data }, (err, res, body) => {
        if (err) {
            return console.log(err, "\n");
        }
        console.info(body, '\n', data, '\n');
    });
}


/* GET home page. */
router.get('/', function (req, res, next) {

    searchTimeStamp = current_time_stamp - (5 * 60 * 1000);

    let BTCEUR = -1;
    let EURBTC = -1;

    getRateByTime('BTCEUR', searchTimeStamp, function (BTCEURRate) {
        if (typeof BTCEURRate.BTCEUR !== 'undefined') {
            BTCEUR = BTCEURRate.BTCEUR.rate;
            getRateByTime('EURBTC', searchTimeStamp, function (EURBTCRate) {
                if (typeof EURBTCRate.EURBTC !== 'undefined') {
                    EURBTC = EURBTCRate.EURBTC.rate;
                    // console.log("Rates", EURBTC, BTCEUR);

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
});

function findRatesByTimestamp(array, timestamp) {
    let element = {};
    for (key in array) {
        let elem = array[key];
        if (elem.current_time_stamp === timestamp) {
            delete elem._id;
            let kk = '';

            if (typeof elem.BTCEUR !== 'undefined') {
                kk = 'BTCEUR'
            } else if (typeof elem.EURBTC !== 'undefined') {
                kk = 'EURBTC'
            } else if (typeof elem.EURETH !== 'undefined') {
                kk = 'EURETH'
            } else if (typeof elem.ETHEUR !== 'undefined') {
                kk = 'ETHEUR'
            } else if (typeof elem.ETHEUR !== 'undefined') {
                kk = 'ETHEUR'
            } else if (typeof elem.BTCETH !== 'undefined') {
                kk = 'BTCETH'
            } else if (typeof elem.LTCEUR !== 'undefined') {
                kk = 'LTCEUR'
            } else if (typeof elem.BTCLTC !== 'undefined') {
                kk = 'BTCLTC'
            } else {
                kk = 'error'
            }
            element[kk] = elem[kk];
        }
        element.current_time_stamp = elem.current_time_stamp
    }
    return element
}

function getRateByTime(searchRate, timestamp, calback) {
    let rez = {};
    MongoClient.connect(url, function (err, client) {
        const col = client.db(dbName).collection('rates');
        let query = {};
        query['current_time_stamp'] = {'$gte': timestamp};
        query[searchRate] = {$exists: true};
        rez = col.findOne(query, function (err, document) {
            calback(document);
        });
        client.close();
    })
}

/* GET home page. */
router.get('/data.json', function (req, res, next) {
    let EURBTCdata = [];
    let BTCEURdata = [];
    let rates = {};
    rates['btc'] = {};

    MongoClient.connect(url, function (err, client) {
        const col = client.db(dbName).collection('rates');
        col.find({}).toArray(function (err, result) {
            history = result
        })
    });

    for (key in history) {
        let element = history[key];
        if (typeof element.EURBTC !== 'undefined') {
            EURBTCdata.push([element.current_time_stamp, (1 / element.EURBTC.rate)])
        }
    }
    rates['btc']['buy'] = EURBTCdata;

    for (key in history) {
        let element = history[key];
        if (typeof element.BTCEUR !== 'undefined') {
            BTCEURdata.push([element.current_time_stamp, element.BTCEUR.rate]);
        }
    }
    rates['btc']['sell'] = BTCEURdata;

    res.render('data', {json: rates})
});

module.exports = router;
