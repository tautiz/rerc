$(document).ready(function () {
    Materialize.updateTextFields();
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

        Highcharts.chart('container', {

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
                        text: 'Exchange rate'
                    }
                },
                {
                    title: {
                        text: 'Exchange rate2'
                    }
                }
            ],

            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: ' EUR'
            },

            legend: {
                enabled: false
            },
            series: [
                {
                    name: 'BTC -> EUR -> BTC',
                    data: data.eur,
                    type: 'arearange',
                    yAxis: 1,
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: Highcharts.getOptions().colors[0],
                    fillOpacity: 0.3,
                    zIndex: 0,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[0]
                    }
                },
                {
                    name: 'BTC -> ETH -> BTC',
                    data: data.eth,
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: Highcharts.getOptions().colors[0],
                    fillOpacity: 0.3,
                    zIndex: 0,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[0]
                    }
                }
            ]
        });
    });
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
