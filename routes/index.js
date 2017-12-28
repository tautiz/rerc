var express = require('express');
var router = express.Router();
var http = require("http");
var https = require("https");
var request = require('request');

let EURBTC = {};
let BTCEUR = {};

let EUR = 2600;
let OLD_BTC = 0.16902117;
let BTC = 0.16815197;

request('https://www.revolut.com/api/quote/internal/EURBTC', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        EURBTC = JSON.parse(body)
        console.log(EURBTC.rate)
     }
})

request('https://www.revolut.com/api/quote/internal/BTCEUR', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        BTCEUR = JSON.parse(body)
        console.log(BTCEUR.rate)      
    }
})

/* GET home page. */
router.get('/', function(req, res, next) {
    request('https://www.revolut.com/api/quote/internal/EURBTC', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            EURBTC = JSON.parse(body)
            console.log(EURBTC.rate)
         }
    })

    request('https://www.revolut.com/api/quote/internal/BTCEUR', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            BTCEUR = JSON.parse(body)
            console.log(BTCEUR.rate)      
        }
    })

  res.render('index', { title: 'Express', BTCEUR:BTCEUR, EURBTC:EURBTC, EUR:EUR, BTC:BTC, OLD_BTC:OLD_BTC});
});

module.exports = router;
