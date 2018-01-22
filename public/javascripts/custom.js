$(document).ready(function () {
    Materialize.updateTextFields()
    var chart
    $.getJSON('/data.json', function (data) {
        chart = Highcharts.chart('container', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'BTC to EUR exchange rate over time'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime'
            },

            yAxis: [
                {
                    title: {
                        text: 'Bitcoin buy rate'
                    }
                }
                ,
                {
                    title: {
                        text: 'Bitcoin sell rate'
                    }
                }
            ],

            tooltip: {
                crosshairs: [true, true],
                shared: false,
                split: false,
                distance: 30,
                padding: 5,
                valueSuffix: ' EUR<br/>'
            },
            legend: {
                enabled: true
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
