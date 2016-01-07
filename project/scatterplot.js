function reDraw() {
	var viewWidth = 500;
	var viewHeight = 500;

	var e = document.getElementById("amountOfClusters");
	var clusterNum = e.options[e.selectedIndex].value

	var clusterColor = ['#a00', '#aa0', '#0a0', '#00a', '#0aa','#7fffd4', '#8b2323', '#ff7f24', '#ff1493', '#c0ff3e'];
	var centroidColor = ['#f00', '#ff0', '#0f0', '#00f', '#0ff','#7fffd4', '#8b2323', '#ff7f24', '#ff1493', '#c0ff3e'];
	var clusterC = [];

	var finish = false;
	var centroidArr = [];

	var margin = {top: 20, right: 20, bottom: 30, left: 40};
	var width = viewWidth - margin.left - margin.right;
	var height = viewHeight - margin.top - margin.bottom;
	var windowRatio = .5;

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var colors = ["blue", "red"];
	var color = d3.scale.linear()
		.range(colors);

	var xValue = "x";
	var yValue = "y";
	var colorValue = "a";

	var svg = d3.select("svg")
		.attr("width", viewWidth)
		.attr("height", viewHeight)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var defs = svg.append( "defs" );

	var points;

	var tooltip = d3.select('.tooltip-content');

	var data;

	var xFunc;
	var yFunc;

	function drawScatterplot() {
		
	  data = tsne_data.nodes;
	  
	  for (var i = 0; i < data.length; i++) {
		  clusterC[i] = i%clusterNum + 1
	  }
	  
	  var xExtent = d3.extent(data, function(d) { return d.tsneX; });
	  var yExtent = d3.extent(data, function(d) { return d.tsneY; });
	  var zExtent = d3.extent(data, function(d) { return d.expression[5];});

	  x.domain(xExtent).nice();
	  y.domain(yExtent).nice();
	  color.domain(zExtent);

	  svg.selectAll("g").remove();
	  
	  xFunc = x;
	  yFunc = y;
	  
	  points = svg.append("g")
		  .attr("class", "plotArea")
		.selectAll(".dot")
		  .data(data)
		.enter().append("circle")
		  .attr("class", "dot")
		  .attr("r", 3.5)
		  .attr("cx", function(d) { return x(d.tsneX); })
		  .attr("cy", function(d) { return y(d.tsneY); })
		.on("mouseover", function(d) {
			  tooltip.transition()
				   .duration(200);
			  tooltip.html(d["tag"]);
			})
		.on("mouseout", function(d) {
			  tooltip.transition()
				   .duration(500);
			  tooltip.html("");
		});
		
		drawClusters();
		calCentroid();
	}

	function drawClusters() {
		d3.selectAll('.dot')
			.data(data)
			.attr({
				fill : 
				function(d,i){
					return clusterColor[clusterC[i]]
				;}
			})		
	}


	function calCentroid () {
		var dataset = d3.selectAll('.dot')[0];    
		var notMove = 0;
		for (var j = 1; j <= clusterNum; j++) {
			var c = {
				"x": d3.mean(dataset, function (d,i) {				
					x = d.getAttribute('cx');
					cluster = clusterC[i];
					
					if (cluster == j) {
						return parseInt(x, 10);
					}
				}),
				"y": d3.mean(dataset, function (d,i) {
					y = d.getAttribute('cy');
					cluster = clusterC[i];

					if (cluster == j) {
						return parseInt(y, 10);
					}
				}),
				"cluster": j
			}
			if (centroidArr.length >= clusterNum && c.x == centroidArr[j - 1].x && c.y == centroidArr[j - 1].y) {
				notMove++;
			}
			if (c.x > 0) {
				centroidArr[j - 1] = c;
			}        
		}

		if (notMove >= clusterNum) {
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
			svg.selectAll('rect')
				.data(centroidArr)
				.enter()
				.append('circle')
				.attr({
					cx : function(d){ return d.x; },
					cy : function(d){ return d.y; },
					r : 0,
					'class': function(d,i){ return 'centroid cluster' + d.cluster; },
					// height : function(d){ return d; },
					fill : function(d,i){ return centroidColor[d.cluster]; },
					"cluster" : function(d){ return d.cluster; }
				})
				.attr("visibility", "hidden")
				.attr({
					r: 7,
					stroke: "black" 
				});
		}
		centroid = false;
		
		if(!finish)
			calDistance();
	}

	function calDistance() {
		d3.selectAll('.dot')
			.attr({
			   fill: function (d,i) {
					min = 10000000;
					cluster = 0;
					for (var j = 1; j <= clusterNum; j++) {
						distance = 
							Math.sqrt(
								Math.pow((centroidArr[j - 1].x - xFunc(d.tsneX)), 2) + Math.pow((centroidArr[j - 1].y - yFunc(d.tsneY)), 2)
							);

						if (min >= distance) {
							min = distance;
							cluster = j;
						}
					}
					clusterC[i] = cluster;
					return clusterColor[cluster];
			   }
			});
		centroid = true;
		if(!finish)
			calCentroid();
	}


	function dataName(v) {

	  if( v == "x")
		return "Latitudinal Position";
	  else if( v == "y")
		return "Longitudinal Position";
	  else if( v == "u")
		return "Latitudinal Velocity";
	  else if( v == "v")
		return "Longitudinal Velocity";
	  else if( v == "m")
		return "Velocity Error";
	  else ( v == "a")
		return "Directional Error";
	}

	function selectVariable(id) {

	  var variable;

	  if(id == 0)
	  {
		var e = document.getElementById("xAxisItem");
		xValue = e.options[e.selectedIndex].value;
	  }
	  else if(id == 1)
	  {
		var e = document.getElementById("yAxisItem");
		yValue = e.options[e.selectedIndex].value;
	  }
	  else if(id == 2)
	  {
		var e = document.getElementById("colorItem");
		colorValue = e.options[e.selectedIndex].value;
	  }

	  updatePoints(xValue, yValue, colorValue);
	}

	function resize() {
	  viewWidth = parseInt(d3.select('#vis').style('width'));
	  viewHeight = viewWidth * windowRatio;

	  width = viewWidth - margin.left - margin.right;
	  height = viewWidth * windowRatio - margin.top - margin.bottom;

	  x.range([0, width]);
	  y.range([height, 0]);

	  d3.select("#container")
		.attr("width", viewWidth);

	  d3.select("#vis")
		.attr("width", viewWidth)
		.attr("height", viewHeight);

	  d3.select("svg")
		.attr("width", viewWidth)
		.attr("height", viewHeight);


	  drawScatterplot(xValue, yValue, colorValue);
	}

	resize();
	d3.select(window).on("resize", resize);
}