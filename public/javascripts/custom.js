$(document).ready(function () {
    Materialize.updateTextFields();
    var chart;
    $.getJSON('/data.json', function (data) {
        console.log(data);
/*
        Highcharts.chart('container', {
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
            yAxis: {
                title: {
                    text: 'Exchange rate'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: 'BTC to EUR',
                data: data
            }]
        });
        */

        chart = Highcharts.chart('container', {

            chart: {
                type: 'arearange',
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
                        text: 'Bitcoin rate'
                    }
                }
                ,
                {
                    title: {
                        text: 'Etherium rate'
                    }
                }
                // ,
                // {
                //     title: {
                //         text: 'Litecoin rate'
                //     }
                // }
            ],

            tooltip: {
                // pointFormat: "{series.name}<br/>Sell: {point.y:.2f} €<br/>Buy: {point.y:.2f} €",
                crosshairs: [true,true],
                shared: true,
                split: true,
                distance: 30,
                padding: 5,
                valueSuffix: ' EUR<br/>'
            },
            legend: {
                enabled: true
            },
            series: [
                {
                    name: 'BTC -> EUR -> BTC<br>',
                    data: data.eur,
                    type: 'arearange',
                    yAxis: 1,
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: Highcharts.getOptions().colors[3],
                    fillOpacity: 0.3,
                    zIndex: 1,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[3]
                    }
                }
                // ,
                // {
                //     name: 'BTC -> ETH -> BTC<br>',
                //     type: 'arearange',
                //     data: data.eth,
                //     lineWidth: 1,
                //     linkedTo: ':previous',
                //     color: Highcharts.getOptions().colors[1],
                //     fillOpacity: 0.3,
                //     zIndex: 2,
                //     marker: {
                //         fillColor: 'white',
                //         lineWidth: 2,
                //         lineColor: Highcharts.getOptions().colors[1]
                //     }
                // },
                // {
                //     name: 'BTC -> LTC -> BTC<br>',
                //     type: 'arearange',
                //     data: data.ltc,
                //     lineWidth: 1,
                //     linkedTo: ':previous',
                //     color: Highcharts.getOptions().colors[0],
                //     fillOpacity: 0.3,
                //     zIndex: 3,
                //     marker: {
                //         fillColor: 'white',
                //         lineWidth: 2,
                //         lineColor: Highcharts.getOptions().colors[0]
                //     }
                // }
            ]
        });
    });
});

// button handler
var i = 0;
$('#button').click(function () {

    if (i === chart.series[0].data.length) {
        i = 0;
    }
    chart.series[0].data[i].select();
    i += 1;
});

var app = angular.module("rercApp", []);

app.filter('beforeDigit', function ($filter) {
    return function (input) {
        if (input>1000)
            return (input % 1000)
        elseif(input<1000)
        return input;
    };
});
