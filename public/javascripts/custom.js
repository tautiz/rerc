$(document).ready(function () {
    Materialize.updateTextFields()
    var BTCchart
    $.getJSON('/data.json', function (data) {
        BTCchart = Highcharts.chart('container', {
            chart: {
                type: 'spline',
                zoomType: 'x'
            },
            title: {
                text: 'BTC to EUR exchange rate over time'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%e. %b',
                    month: '%e. %b',
                    year: '%b'
                },
                title: {
                    text: 'Date'
                }
            },

            yAxis: [
                {
                    title: {
                        text: 'Rates'
                    }
                },
                {
                    title: {
                        text: 'Rates'
                    }
                }
            ],

            tooltip: {
                crosshairs: [true, true],
                split: false,
                valueSuffix: ' €'
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },
            series: [
                {
                    name: 'Buy rate:',
                    data: data.btc.buy,
                    yAxis: 1,
                    lineWidth: 2,
                    linkedTo: ':previous',
                    color: Highcharts.getOptions().colors[3],
                    fillOpacity: 0.3,
                    zIndex: 1,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[3]
                    }
                },
                {
                    name: 'Sell rate:',
                    data: data.btc.sell,
                    yAxis: 1,
                    lineWidth: 2,
                    linkedTo: ':previous',
                    color: Highcharts.getOptions().colors[2],
                    fillOpacity: 0.3,
                    zIndex: 1,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[2]
                    }
                }
            ]
        })
    })
})

let app = angular.module('rercApp', [])

app.filter('beforeDigit', function ($filter) {
    return function (input) {
        if (input > 1000)
            return (input % 1000)
        else
            if (input < 1000)
                return input
    }
})
