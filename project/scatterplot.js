var viewWidth = 500;
var viewHeight = 500;

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = viewWidth - margin.left - margin.right;
var height = viewHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var colors = ["blue", "red"];
var color = d3.scale.linear()
    .range(colors);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    
var xValue = "x";
var yValue = "y";
var colorValue = "a";

var svg = d3.select("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var defs = svg.append( "defs" );

var legendGradient = defs.append( "linearGradient" )
    .attr( "id", "legendGradient" )
    .attr( "x1", "0" )
    .attr( "x2", "0" )
    .attr( "y1", "1" )
    .attr( "y2", "0" );

legendGradient.append( "stop" )
    .attr( "id", "gradientStart" )
    .attr( "offset", "0%" )
    .style( "stop-opacity", 1);

legendGradient.append( "stop" )
    .attr( "id", "gradientStop" )
    .attr( "offset", "100%" )
    .style( "stop-opacity", 1);
    
var points;

function drawScatterplot(v1, v2 ,v3) {
	
  var data = boat_data.boats;
  
  var xExtent = d3.extent(data, function(d) { return d[v1]; });
  var yExtent = d3.extent(data, function(d) { return d[v2]; });
  var zExtent = d3.extent(data, function(d) { return d[v3];});

  x.domain(xExtent).nice();
  y.domain(yExtent).nice();
  color.domain(zExtent);
  
  svg.selectAll("g").remove();

  svg.append("g")
      .attr("id", "xAxis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("id", "xLabel")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(dataName(v1));

  svg.append("g")
      .attr("id", "yAxis")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("id", "yLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(dataName(v2));

  points = svg.append("g")
      .attr("class", "plotArea")
    .selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d[v1]); })
      .attr("cy", function(d) { return y(d[v2]); })
      .style("fill", function(d) { return color(d[v3]); });
  
  svg.select("#gradientStart")
    .style("stop-color", colors[0]);
  svg.select("#gradientStop")
    .style("stop-color", colors[1]);

  var legend = svg.append("g")
      .attr("class", "legend");

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 72)
      .style("fill", "url(#legendGradient)");

  legend.append("text")
      .attr("x", width - 22)
      .attr("y", 6)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("high");

  legend.append("text")
      .attr("x", width - 22)
      .attr("y", 66)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("low");

  legend.append("text")
      .attr("id", "colorLabel")
      .attr("x", width)
      .attr("y", 82)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(dataName(v3));
}

function updatePoints(v1, v2 ,v3) {
  
  var xExtent = d3.extent(boat_data.boats, function(d) { return d[v1]; });
  var yExtent = d3.extent(boat_data.boats, function(d) { return d[v2]; });
  var zExtent = d3.extent(boat_data.boats, function(d) { return d[v3]; });

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
    .style("fill", function(d) { return color(d[v3]); });
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
  
  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight-50;

  width = viewWidth - margin.left - margin.right;
  height = viewHeight - margin.top - margin.bottom;

  x.range([0, width]);
  y.range([height, 0]);

  xAxis.scale(x);
  yAxis.scale(y);
  
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