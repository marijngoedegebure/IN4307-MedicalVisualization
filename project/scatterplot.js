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

var x_scale = d3.scale.linear()
	.range([0, width]);

var y_scale = d3.scale.linear()
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

var inspector = d3.select('.inspector-content');

var data;

var xFunc;
var yFunc;

var mouse_down = false;
var mouse_down_coords;

function drawScatterplot() {

  data = tsne_data.nodes;

  var xExtent = d3.extent(data, function(d) { return d.tsneX; });
  var yExtent = d3.extent(data, function(d) { return d.tsneY; });
  var zExtent = d3.extent(data, function(d) { return d.expression[5];});

  x_scale.domain(xExtent).nice();
  y_scale.domain(yExtent).nice();
  color.domain(zExtent);

  svg.selectAll("g").remove();

  xFunc = x_scale;
  yFunc = y_scale;

  d3.selectAll('.dot').remove();

	svg.append('svg:rect')
  .attr('width', width) // the whole width of g/svg
  .attr('height', height) // the whole heigh of g/svg
  .attr("fill", "white")

  points = svg.append("g")
    .attr("class", "plotArea")
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) { return x_scale(d.tsneX); })
    .attr("cy", function(d) { return y_scale(d.tsneY); });

		svg.append('svg:rect')
		.attr('class', 'mouse_rect')
	  .attr('width', width) // the whole width of g/svg
	  .attr('height', height) // the whole heigh of g/svg
	  .attr("fill", "white")
		.attr("opacity", "0.0")
	  .attr('pointer-events', 'all')
	  .on('mousedown', function() {
	      console.log("Mouse down event");
	      svg.selectAll(".drag-and-select").remove();

	      mouse_down = true;
	      mouse_down_coords = d3.mouse(this);
	      d3.select('.plotArea').append("rect")
	      .attr("class", "drag-and-select")
	      .attr("x", Math.round(mouse_down_coords[0]))
	      .attr("y", Math.round(mouse_down_coords[1]))
	      .attr("width", 0)
	      .attr("height", 0)
				.attr("opacity", 0.5);
	  })
	  .on('mouseup', function() {
	      mouseUpHandler();
	  })
	  .on("mousemove", function() {
	    if(mouse_down) {
	      mouseMoveHandle(d3.mouse(this));
	    }
	  })
	  .on("mouseup", function() {
	    mouseUpHandler();
	  });

	recalculateClusters();
}

function reFillPoints() {
	if(GetMode()=='Selection') {
		d3.selectAll(".selected")
	    .attr("fill", "red");
		d3.selectAll(".dot").filter("*:not(.selected)")
			.attr("fill", "black");
	}

	if(GetMode()=='Clusters') {
		drawClusters();
	}
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
		.attr({
			class : 
			function (d, i) {
				if(d3.select(this).classed("selected")) 
					return "selected" + " " + "dot" + " " + clusterColor[clusterC[i]];
				else
					return "dot" + " " + clusterColor[clusterC[i]];
			}
		});
}

function recalculateClusters() {
	e = document.getElementById("amountOfClusters");
	clusterNum = e.options[e.selectedIndex].value
	finish = false;
	for (var i = 0; i < data.length; i++) {
		clusterC[i] = i%clusterNum + 1
	}
	calCentroid();
	drawClusters();
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
		})
		.attr({
			class : 
			function (d, i) {
				if(d3.select(this).classed("selected")) 
					return "selected" + " " + "dot" + " " + clusterColor[clusterC[i]];
				else
					return "dot" + " " + clusterColor[clusterC[i]];
			}
		});
	centroid = true;
	if(!finish)
		calCentroid();
}

function mouseUpHandler() {
  console.log("Mouse up event");
  mouse_down = false;
  // Check which points are inside the selection box
  d3.selectAll(".dot")
    .filter(function(element, index, array) {
      return insideRectangleCheck(element);
    })
    .classed("selected", true);
	reFillPoints();
  UpdateSelectionCounter();
  UpdateInspector();
  svg.selectAll(".drag-and-select").remove();
}

function insideRectangleCheck(element) {
  var rectangle = d3.select(".drag-and-select");
  rect_x = parseFloat(rectangle.attr("x"));
  rect_y = parseFloat(rectangle.attr("y"));
  rect_w = parseFloat(rectangle.attr("width"));
  rect_h = parseFloat(rectangle.attr("height"));
  elem_x = xFunc(element.tsneX);
  elem_y = yFunc(element.tsneY);
  if (rect_x < elem_x && rect_y < elem_y && rect_x+rect_w > elem_x && rect_y+rect_h > elem_y) {
    return true;
  }
  return false;
}

function mouseMoveHandle(current_coords) {
  var w, h, x, y = 0;
  if (current_coords[0] < mouse_down_coords[0] && current_coords[1] < mouse_down_coords[1]) {
    x = current_coords[0];
    y = current_coords[1];
    w = Math.round(mouse_down_coords[0] - current_coords[0]);
    h = Math.round( mouse_down_coords[1] - current_coords[1]);
  }
  else if (current_coords[0] < mouse_down_coords[0] && current_coords[1] > mouse_down_coords[1]) {
    x = current_coords[0];
    y = mouse_down_coords[1];
    w = Math.round(mouse_down_coords[0] - current_coords[0]);
    h = Math.round(current_coords[1] - mouse_down_coords[1]);
  }
  else if (current_coords[0] > mouse_down_coords[0] && current_coords[1] < mouse_down_coords[1]) {
    x = mouse_down_coords[0];
    y = current_coords[1];
    w = Math.round(current_coords[0] - mouse_down_coords[0]);
    h = Math.round(mouse_down_coords[1] - current_coords[1]);
  }
  else {
    x = mouse_down_coords[0];
    y = mouse_down_coords[1];
    w = Math.round(current_coords[0] - mouse_down_coords[0]);
    h = Math.round(current_coords[1] - mouse_down_coords[1]);
  }
  adjustSelectionBox(w, h, x, y);
}

function adjustSelectionBox(width, height, x, y) {
  d3.select(".drag-and-select")
  .attr("width", width)
  .attr("height", height)
  .attr("x", x)
  .attr("y", y);
}

function resize() {
  viewWidth = parseInt(d3.select('#vis').style('width'));
  viewHeight = viewWidth * windowRatio;

  width = viewWidth - margin.left - margin.right;
  height = viewWidth * windowRatio - margin.top - margin.bottom;

  x_scale.range([0, width]);
  y_scale.range([height, 0]);

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
