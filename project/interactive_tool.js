var mode = 'Clusters';

var svgs = [];
var global_x_scale_inspector;
var global_y_scale_inspector;

$('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');

var all_data;
setupFeatureDropdown();

function setupFeatureDropdown() {
  all_data = d3.selectAll('.dot').data();
  for(var i = 1; i<=32; i++) {
    $('.feature-dropdown').append("<div class='switch feature-" + i +"'>");
    $('.feature-'+i).append("<p class='feature-label'>Feature " + i  + "</p>");
    $('.feature-'+i).append("<input class='switch-input' id='feature" + i + "-checkbox' type='checkbox' name='feature" + i + "-checkbox' onchange='featuredChecked("+i+");'>");
    $('.feature-'+i).append(
      "<label class='switch-paddle' for='feature" + i + "-checkbox'>" +
      "<span class='show-for-sr'>Feature " + i + "</span>" +
      "</label>");
    $('.feature-dropdown').append("</div>");
  }
}

function featuredChecked(feature) {
  UpdateInspector();
}

function UpdateSelectionCounter() {
  $('#selected_count').remove();
  $('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');
}

function ClearSelection() {
    d3.selectAll('.selected').classed("selected", false);
    reFillPoints();
    hideInspector();
    UpdateSelectionCounter();
    removeAllSVGs();
}

function ResetClusterSelection() {
  d3.selectAll('.dot')
	.style('opacity', 1)	
	.style("stroke-width", 0.25)
	
  selectionMade = "";
  
  hideInspector();
  removeAllSVGs();
}

function RemoveClusters() {
  e = document.getElementById("amountOfClusters").value = 1;
	recalculateClusters();
  ResetClusterSelection();
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
  if (mode == 'Clusters') {
    if(selectedCluster==".none") {
      hideInspector();
      return;
    }

    if(d3.selectAll(selectedCluster).data().length == 0) {
      ResetClusterSelection();
    }
    else {
      updateSVGs(d3.selectAll(selectedCluster).data());
    }
  }
  else {
    if(d3.selectAll('.selected').data().length == 0) {
      hideInspector();
      return;
    }
    updateSVGs(d3.selectAll('.selected').data());
  }
  showInspector();
}

function drawKDE(current_data, filtered_all_data, svg_package){
  var xExtentInspector = d3.extent(current_data, function(d) { return d; });

  var x_scale_range_input = parseInt($('#x-axis-setting').val());
  var x_scale_inspector;
  if(x_scale_range_input) {
    x_scale_inspector = d3.scale.linear()
      .domain([0,x_scale_range_input])
      .range([0, svg_package.width_inspector]);
  }
  else {
    var x_scale_inspector = d3.scale.linear()
      .domain(xExtentInspector)
      .range([0, svg_package.width_inspector]);
  }

  var y_scale_inspector = d3.scale.linear()
    .domain([0, 1])
    .range([svg_package.height_inspector, 0]);

  var xAxis_inspector = d3.svg.axis()
      .scale(x_scale_inspector)
      .orient("bottom");

  var yAxis_inspector = d3.svg.axis()
      .scale(y_scale_inspector)
      .orient("left");

  // Uncomment for axis
  svg_package.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + svg_package.height_inspector + ")")
  .append("text")
    .attr("class", "label")
    .attr("x", svg_package.width_inspector)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text(x_scale_range_input ? x_scale_range_input : Math.round(xExtentInspector[1]).toFixed(2));

  svg_package.svg.append("g")
    .attr("class", "y axis")
    .call(yAxis_inspector);

  numHistBins = Math.ceil(Math.sqrt(current_data.length));

  histogram = d3.layout.histogram()
    .frequency(false)
    .bins(numHistBins);

  var histogram_data = histogram(current_data);

  // Uncomment for histogram
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

  svg_package.svg.append("path")
    .datum(kde(filtered_all_data))
    .attr("class", "all-data-line")
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
  mode = new_mode;
  reFillPoints();
  UpdateInspector();
  
  if(new_mode === 'Selection') {
	  d3.select('.mouse_rect')
		.attr("display", "")
	  d3.selectAll('.dot')
		.style('opacity', 1)	
		.style("stroke-width", 0.25)
  } else {
	  d3.select('.mouse_rect')
		.attr("display", "none")
		if(!(selectionMade === ""))
			d3.selectAll(selectionMade)
				.style('opacity', 0.5)
				.style("stroke-width", 2.0)
  }
}

function createSingleSVG(feature_num, selected_data) {
  // Setup svg for inspector
  var viewWidth_inspector = 250;
  var viewHeight_inspector = 250;

  var margin_inspector = {top: 20, right: 20, bottom: 20, left: 20};
  var width_inspector = viewWidth_inspector - margin_inspector.left - margin_inspector.right;
  var height_inspector = viewHeight_inspector - margin_inspector.top - margin_inspector.bottom;
  var windowRatio_inspector = .5;

  // Add integer i to differ between different svg's
  $('.inspector-vis').append("<div id='inspector-div-"+feature_num +"' class='inspector-div'>");
  $("#inspector-div-"+feature_num).append("<p class='inspector-svg-para'>Feature " + feature_num + "</p>")
  var inspector_svg = d3.select("#inspector-div-"+feature_num).append("svg")
    .attr("class", "inspector-svg-"+feature_num + " inspector-svg")
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
    $('.inspector-vis').append("</div>");
    feature_data = [];
    for(var i = 0;i<selected_data.length;i++) {
      feature_data.push(selected_data[i].expression[feature_num-1]);
    }
    var filtered_all_data = [];
    for(var i = 0;i<all_data.length;i++) {
      filtered_all_data.push(all_data[i].expression[feature_num-1]);
    }
    drawKDE(feature_data, filtered_all_data, svg_package);
}

function removeSVG(feature_num) {
  for(var i = 0;i<svgs.length;i++) {
    if(svgs[i].feature == feature_num) {
      d3.select('.inspector-svg-'+feature_num).remove();
      svgs.splice(i, 1);
    }
  }
}

function removeAllSVGs() {
  svgs = [];
  $('.inspector-vis').empty();
}

function getAllSelectedFeatures() {
  var selected_features = []
  for(var i = 1;i<=32;i++) {
    if ($("#feature" + i + "-checkbox").is(":checked")) {
      selected_features.push(i);
    }
  }
  return selected_features;
}

function createSVGs(selected_features, selected_data) {
  for(var i = 0; i<selected_features.length; i++) {
    createSingleSVG(selected_features[i], selected_data);
  }
}

function updateSVGs(selected_data) {
  removeAllSVGs();
  createSVGs(getAllSelectedFeatures(), selected_data);
}
