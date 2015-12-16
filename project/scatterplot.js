var viewWidth = 500;
var viewHeight = 500;

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

function drawScatterplot() {
	
  var data = tsne_data.nodes;
  
  var xExtent = d3.extent(data, function(d) { return d.tsneX; });
  var yExtent = d3.extent(data, function(d) { return d.tsneY; });
  var zExtent = d3.extent(data, function(d) { return d.expression[5];});

  x.domain(xExtent).nice();
  y.domain(yExtent).nice();
  color.domain(zExtent);

  svg.selectAll("g").remove();

  points = svg.append("g")
      .attr("class", "plotArea")
    .selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.tsneX); })
      .attr("cy", function(d) { return y(d.tsneY); })
}

function updatePoints(v1, v2 ,v3) {

  var xExtent = d3.extent(tsne_data.nodes, function(d) { return d[v1]; });
  var yExtent = d3.extent(tsne_data.nodes, function(d) { return d[v2]; });
  var zExtent = d3.extent(tsne_data.nodes, function(d) { return d[v3]; });

  x.domain(xExtent).nice();
  y.domain(yExtent).nice();
  color.domain(zExtent);

  d3.select("#xLabel").text(dataName(v1));
  d3.select("#yLabel").text(dataName(v2));
  d3.select("#colorLabel").text(dataName(v3));

  d3.select("#xAxis").call(xAxis);
  d3.select("#yAxis").call(yAxis);

  points.transition()
    .duration(750)
    .ease("cubic")
    .attr("cx", function(d) { return x(d[v1]); })
    .attr("cy", function(d) { return y(d[v2]); })
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
