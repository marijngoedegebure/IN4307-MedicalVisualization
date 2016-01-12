var mode = 'Clusters';

var svgs = [];
var global_x_scale_inspector;
var global_y_scale_inspector;

$('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');

function featuredChecked(feature) {
  if($("#feature" + feature + "-checkbox").is(":checked")) {
    createSVG(feature);
  }
  else {
    removeSVG(feature);
  }
  UpdateInspector();
}

function UpdateSelectionCounter() {
  $('#selected_count').remove();
  $('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');
}

function ClearSelection() {
    d3.selectAll('.selected').classed("selected", false).style("fill", "black");
    $('.inspector-content').empty();
    hideInspector();
    UpdateSelectionCounter();
}

function RemoveClusters() {
    e = document.getElementById("amountOfClusters").value = 1;
	recalculateClusters();
}

function hideInspector() {
  $('.elements-are-selected').addClass('hide').removeClass('show');
  $('.nothing-selected').addClass('show').removeClass('hide');
}

function showInspector() {
  $('.elements-are-selected').addClass('show').removeClass('hide');
  $('.nothing-selected').addClass('hide').removeClass('show');
}

function UpdateInspector() {
  if (d3.selectAll('.selected').empty()) {
    hideInspector();
    return;
  }
  else {
    showInspector();
    var tooltip = d3.select('.tooltip-content');
    $('.inspector-content').append("<p id='current_mode'>" + mode + "</p>");

    // Update drawn KDE's because of newly selected data
  }
}

function drawKDE(current_data, svg_package){
  var x_scale_inspector = d3.scale.linear()
    .domain([0, 1])
    .range([0, svg_package.width_inspector]);

  var y_scale_inspector = d3.scale.linear()
    .domain([0, 1])
    .range([svg_package.height_inspector, 0]);

  var xAxis_inspector = d3.svg.axis()
      .scale(x_scale_inspector)
      .orient("bottom");

  var yAxis_inspector = d3.svg.axis()
      .scale(y_scale_inspector)
      .orient("left");

  svg_package.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + svg_package.height_inspector + ")")
    .call(xAxis_inspector)
  .append("text")
    .attr("class", "label")
    .attr("x", svg_package.width_inspector)
    .attr("y", -6)
    .style("text-anchor", "end");

  svg_package.svg.append("g")
    .attr("class", "y axis")
    .call(yAxis_inspector);

  numHistBins = Math.ceil(Math.sqrt(current_data.length));

  histogram = d3.layout.histogram()
    .frequency(false)
    .bins(numHistBins);

  var histogram_data = histogram(current_data);

  svg_package.svg.selectAll(".bar")
      .data(histogram_data)
    .enter().insert("rect", ".axis")
      .attr("class", "bar")
      .attr("x", function(d) { return x_scale_inspector(d.x) + 1; })
      .attr("y", function(d) { return y_scale_inspector(d.y); })
      .attr("width", x_scale_inspector(histogram_data[0].dx + histogram_data[0].x) - x_scale_inspector(histogram_data[0].x) - 1)
      .attr("height", function(d) { return svg_package.height_inspector - y_scale_inspector(d.y); });

  kde = kernelDensityEstimator(epanechnikovKernel(0.1), x_scale_inspector.ticks(100));
  global_x_scale_inspector = x_scale_inspector;
  global_y_scale_inspector = y_scale_inspector;
  svg_package.svg.append("path")
    .datum(kde(current_data))
    .attr("class", "line")
    .attr("d", line);
}

var line = d3.svg.line()
    .x(function(d) {
      return global_x_scale_inspector(d[0]);
    })
    .y(function(d) {
      return global_y_scale_inspector(d[1]);
    });

function kernelDensityEstimator(kernel, x_temp) {
  return function(sample) {
    return x_temp.map(function(x_temp) {
      return [x_temp, d3.mean(sample, function(v) { return kernel(x_temp - v); })];
    });
  };
}

function epanechnikovKernel(scale) {
  return function(u) {
    return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
  };
}

function GetMode() {
  return mode;
}

function SwitchModes(new_mode) {
  if(new_mode === 'Selection') {
	  d3.select('.mouse_rect')
		.attr("display", "")
  } else {
	  d3.select('.mouse_rect')
		.attr("display", "none")
  }
  mode = new_mode;
  reFillPoints();
  UpdateInspector();
}

function createSVG(feature_num) {
  // Setup svg for inspector
  var viewWidth_inspector = 500;
  var viewHeight_inspector = 500;

  var margin_inspector = {top: 20, right: 20, bottom: 30, left: 40};
  var width_inspector = viewWidth_inspector - margin_inspector.left - margin_inspector.right;
  var height_inspector = viewHeight_inspector - margin_inspector.top - margin_inspector.bottom;
  var windowRatio_inspector = .5;

  // Add integer i to differ between different svg's
  var inspector_svg = d3.select(".inspector-vis").append("svg")
    .attr("class", "inspector-svg-"+feature_num)
  	.attr("width", viewWidth_inspector)
  	.attr("height", viewHeight_inspector)
    .append("g")
  	.attr("transform", "translate(" + margin_inspector.left + "," + margin_inspector.top + ")");
    svg_package = {
      'feature': feature_num,
      'margin_inspector': margin_inspector,
      'width_inspector': width_inspector,
      'height_inspector': height_inspector,
      'svg': inspector_svg,
    }
    svgs.push(svg_package);
    feature_data = [];
    selected_data = d3.selectAll('.selected').data();
    for(var i = 0;i<selected_data.length;i++) {
      feature_data.push(selected_data[i].expression[feature_num-1]);
    }
    drawKDE(feature_data, svg_package);
}

function removeSVG(feature_num) {
  for(var i = 0;i<svgs.length;i++) {
    if(svgs[i].feature == feature_num) {
      d3.select('.inspector-svg-'+feature_num).remove();
      svgs.splice(i, 1);
    }
  }
}
