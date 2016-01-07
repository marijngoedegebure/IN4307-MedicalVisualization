// Amount of data points
var dataNum = 3000;
// Amount of clusters
var clusterNum = 5;
var centroid = true;
var first = false;
var finish = false;
var dataset = []
var centroidArr = []

clusterColor = ['#a00', '#aa0', '#0a0', '#00a', '#0aa']
centroidColor = ['#f00', '#ff0', '#0f0', '#00f', '#0ff']

// Append a div for the menu and a svg for the plot
var svg = d3.select('#drawArea')
    .append('div')
    .attr({
        'id': 'main'
    })
    .style({
        'margin': '0 auto',
        'display': '-webkit-box'
    })
    .append('svg')
    .style({
        'background-color': '#ccc',
        'height': '400px',
        'width': '400px'
    });
	
// Append the side menu
var process = d3.select('#main')
    .append('div')
    .attr({
        'id': 'process'
    })
    .style({
        'background-color': 'green',
        'height': '400px',
        'width': '300px'
    })

// Add top 2 buttons to the menu
//  Stepを進めるボタン
process.append('button')
    .style({
        'background-color': '#a00',
        'border-radius': '10px',
        'color': '#ddd',
        'height': '40px',
        'margin': '0 auto',
        'width': '100px',
        'text-align': 'center'
    })
    .on('click', function () {
        if (!first) {
            firstCluster();
            d3.selectAll('.processDescription')
                .style({
                    'background-color': function (d, i) {
                        if (i == 0) {
                            return 'white';
                        } else {
                            return 'gray';
                        }
                    }
                });
        } else {
            if (centroid) {
                d3.selectAll('.processDescription')
                .style({
                    'background-color': function (d, i) {
                        if (i == 1) {
                            return 'white';
                        } else {
                            return 'gray';
                        }
                    }
                });
                calCentroid();
            } else {
                if (!finish) {
                    d3.selectAll('.processDescription')
                    .style({
                        'background-color': function (d, i) {
                            if (i == 2) {
                                return 'white';
                            } else {
                                return 'gray';
                            }
                        }
                    });
                    calDistance();
                }
            }
        }
    })
    .text('Next Step');

//  Reset Button
process.append('button')
    .style({
        'background-color': '#a00',
        'border-radius': '10px',
        'color': '#ddd',
        'height': '40px',
        'margin': '0 auto',
        'width': '100px',
        'text-align': 'center'
    })
    .on('click', function () {
        init();
    })
    .text('From the Start');

init();

var processArray = [
    'Random add points to a cluster',
    '(Recenter) Point between average distance from all points in according cluster',
    'Rematch points to cluster',
    'No more Steps found'
];
// The Text in the boxes explaining what happens
process
    .selectAll('div')
    .data(processArray)
    .enter()
    .append('div')
    .attr({
        'id': function(d, i) {
            return 'process' + i;
        },
        'class': 'processDescription'
    })
    .style({
        'border': 'solid 2px #333',
        'margin': '10px',
        'height': '70px'
    })
    .text(function(d) { return d; })

function init () {
    dataset = []
    centroidArr = []
    centroid = true;
    first = false;
    finish = false;

	// Creates points for dataset
    for (var i = 0; i < dataNum; i++) {
        rand = parseInt((Math.random() * clusterNum), 10);
        obj = {
            x: parseInt(normalRand(80 * rand + 100, 30), 10),
            y: parseInt(normalRand(80 * rand + 100, 30), 10),
            cluster: parseInt(Math.random() * clusterNum, 10) + 1
        }
        dataset.push(obj);
    }
	// Something not used
    svg.selectAll('circle')
        .remove();

    // データを点として打つ
    var dataPoint = svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('circle')
        .attr({
            'class': 'data',
            cx : function(d){ return d.x; },
            cy : function(d){ return d.y; },
            r : 0,
            'cluster' : function(d){ return d.cluster; }
        })
        .attr({
            r: 5
        });
}

function firstCluster () {
    d3.selectAll('.data')
        .data(dataset)
        .attr({
            fill : function(d){ return clusterColor[d.cluster]; }
    })

    first = true;
}

function calCentroid () {
    var dataset = d3.selectAll('.data')[0];    
    var notMove = 0;
    // 重心の作成
    for (var i = 1; i <= clusterNum; i++) {
        var c = {
            "x": d3.mean(dataset, function (d) {
                x = d.getAttribute('cx');
                cluster = d.getAttribute('cluster');
                
                if (cluster == i) {
                    return parseInt(x, 10);
                }
            }),
            "y": d3.mean(dataset, function (d) {
                y = d.getAttribute('cx');
                cluster = d.getAttribute('cluster');

                if (cluster == i) {
                    return parseInt(y, 10);
                }
            }),
            "cluster": i
        }
        if (centroidArr.length >= clusterNum && c.x == centroidArr[i - 1].x && c.y == centroidArr[i - 1].y) {
            notMove++;
        }
		console.log(c.x);
        if (c.x > 0) {
            centroidArr[i - 1] = c;
        }        
    }

    if (notMove >= clusterNum) {
        d3.selectAll('.processDescription')
            .style({
                'background-color': function (d, i) {
                    if (i == 3) {
                        return 'white';
                    } else {
                        return 'gray';
                    }
                }
            });
        finish = true;
    }

    if (d3.selectAll('.centroid')[0].length > 0) {
        svg.selectAll('.centroid')
            .data(centroidArr)
            .attr({
                cx : function(d) { return d.x; },
                cy : function(d) { return d.y; }
            });
    } else {
         // データを点として打つ
        svg.selectAll('rect')
            .data(centroidArr)
            .enter()
            .append('circle')
            .attr({
                cx : function(d){ return d.x; },
                cy : function(d){ return d.y; },
                r : 0,
                'class': function(d){ return 'centroid cluster' + d.cluster; },
                // height : function(d){ return d; },
                fill : function(d){ return centroidColor[d.cluster]; },
                "cluster" : function(d){ return d.cluster; }
            })
            .attr({
                r: 7,
                stroke: "black" 
            });
    }
    centroid = false;
	//if(!finish){
	//	calDistance();	
	//}
}

function calDistance() {
        d3.selectAll('.data')
            .attr({
               fill: function (d) {
                    min = 10000000;
                    cluster = 0;

                    for (var i = 1; i <= clusterNum; i++) {
                        // ユークリッド距離の計算
                        distance = 
                            Math.sqrt(
                                Math.pow((centroidArr[i - 1].x - d.x), 2) + Math.pow((centroidArr[i - 1].y - d.y), 2)
                            );

                        if (min >= distance) {
                            min = distance;
                            cluster = i;
                        }
                    }
                    return clusterColor[cluster];
               },
               cluster: function (d) {
                    min = 10000000;
                    cluster = 0;

                    for (var i = 1; i <= clusterNum; i++) {
                        // ユークリッド距離の計算
                        distance = 
                            Math.sqrt(
                                Math.pow((centroidArr[i - 1].x - d.x), 2) + Math.pow((centroidArr[i - 1].y - d.y), 2)
                            );
                        if (min >= distance) {
                            min = distance;
                            cluster = i;
                        }
                    }
                    return cluster;
               }
            });
    centroid = true;
	//if(!finish){
	//	calCentroid();	
	//}
}

// 正規分布を作成
function normalRand (mean, sigma) {
    var a = 1 - Math.random();
    var b = 1 - Math.random();
    var c = Math.sqrt(-2 * Math.log(a));
    if(0.5 - Math.random() > 0) {
        return c * Math.sin(Math.PI * 2 * b) * sigma + mean;
    }else{
        return c * Math.cos(Math.PI * 2 * b) * sigma + mean;
    }
};