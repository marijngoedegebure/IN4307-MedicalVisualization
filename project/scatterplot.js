var viewWidth = 500;
var viewHeight = 500;

var margin = {top: 10, right: 10, bottom: 10, left: 10};
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


var mouse_down = false;
var mouse_down_coords;

function drawScatterplot() {
	
  var data = tsne_data.nodes;
  
  var xExtent = d3.extent(data, function(d) { return d.tsneX; });
  var yExtent = d3.extent(data, function(d) { return d.tsneY; });
  var zExtent = d3.extent(data, function(d) { return d.expression[5];});

  x.domain(xExtent).nice();
  y.domain(yExtent).nice();
  color.domain(zExtent);

  svg.selectAll("g").remove();

  svg.append('svg:rect')
  .attr('width', width) // the whole width of g/svg
  .attr('height', height) // the whole heigh of g/svg
  .attr("fill", "white")
  .attr('pointer-events', 'all')
  .on('mousedown', function() {
      console.log("Mouse down event");
      svg.selectAll(".drag-and-select").remove();

      mouse_down = true;
      mouse_down_coords = d3.mouse(this);

      svg.append("rect")
      .attr("class", "drag-and-select")
      .attr("x", Math.round(mouse_down_coords[0]))
      .attr("y", Math.round(mouse_down_coords[1]))
      .attr("width", 0)
      .attr("height", 0)
      .on('mouseup', function() {
        mouseUpHandler();
      });
    })
  .on("mousemove", function() {
    if(mouse_down) {
      mouseMoveHandle(d3.mouse(this));
    }
  })
  .on("mouseup", function() {
    mouseUpHandler();
  });

  points = svg.append("g")
    .attr("class", "plotArea")
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function(d) { return x(d.tsneX); })
    .attr("cy", function(d) { return y(d.tsneY); })
    .attr("fill", "black");
}

function mouseUpHandler() {
  console.log("Mouse up event");
  mouse_down = false;
  // Check which points are inside the selection box
  d3.selectAll(".dot")
    .filter(function(element, index, array) {
      return insideRectangleCheck(element);
    })
    .classed("selected", true)
    .style("fill", "red");
  UpdateSelectionCounter();
  UpdateTooltip();
  svg.selectAll(".drag-and-select").remove();
}

function insideRectangleCheck(element) {
  var rectangle = d3.select(".drag-and-select");
  rect_x = parseFloat(rectangle.attr("x"));
  rect_y = parseFloat(rectangle.attr("y"));
  rect_w = parseFloat(rectangle.attr("width"));
  rect_h = parseFloat(rectangle.attr("height"));
  elem_x = x(element.tsneX);
  elem_y = y(element.tsneY);
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
