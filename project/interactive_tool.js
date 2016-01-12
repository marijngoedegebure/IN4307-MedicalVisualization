var mode = 'Clusters';

// Setup svg for inspector
var viewWidth_inspector = 500;
var viewHeight_inspector = 500;

var margin_inspector = {top: 20, right: 20, bottom: 30, left: 40};
var width_inspector = viewWidth_inspector - margin_inspector.left - margin_inspector.right;
var height_inspector = viewHeight_inspector - margin_inspector.top - margin_inspector.bottom;
var windowRatio_inspector = .5;

var x_scale_inspector = d3.scale.linear()
	.range([0, width_inspector]);

var y_scale_inspector = d3.scale.linear()
	.range([height_inspector, 0]);

var xAxis_inspector = d3.svg.axis()
    .scale(x_scale_inspector)
    .orient("bottom");

var yAxis_inspector = d3.svg.axis()
    .scale(y_scale_inspector)
    .orient("left")
    .tickFormat(d3.format("%"));

var inspector_svg = d3.select(".inspector-svg")
	.attr("width", viewWidth_inspector)
	.attr("height", viewHeight_inspector)
  .append("g")
	.attr("transform", "translate(" + margin_inspector.left + "," + margin_inspector.top + ")");

$('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');

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

    $('.inspector-content').append("<div class='row inspector-row'>");
    $('.inspector-row').append("<div class='columns small-6 selected-data'>");

    selected_data = d3.selectAll('.selected').data();
    mean_tsnex = d3.mean(selected_data, function(d) { return d.tsneX})
    mean_tsney = d3.mean(selected_data, function(d) { return d.tsneY})
    mean_feature_1_selected = d3.mean(selected_data, function(d) { return d.expression[0]})
    std_feature_1_selected = d3.deviation(selected_data, function(d) { return d.expression[0]})
    mean_feature_2_selected = d3.mean(selected_data, function(d) { return d.expression[1]})
    mean_feature_3_selected = d3.mean(selected_data, function(d) { return d.expression[2]})
    mean_feature_4_selected = d3.mean(selected_data, function(d) { return d.expression[3]})
    mean_feature_5_selected = d3.mean(selected_data, function(d) { return d.expression[4]})
    mean_feature_6_selected = d3.mean(selected_data, function(d) { return d.expression[5]})
    $('.selected-data').append("<h4>Selected data</h4>");
    $('.selected-data').append("<p id='tsnex_mean'>Mean tsnex: " + mean_tsnex + "</p>");
    $('.selected-data').append("<p id='tsney_mean'>Mean tsney: " + mean_tsney + "</p>");
    $('.selected-data').append("<p id='feature1_mean'>Mean feature 1: " + mean_feature_1_selected + "</p>");
    $('.selected-data').append("<p id='feature2_mean'>Mean feature 2: " + mean_feature_2_selected + "</p>");
    $('.selected-data').append("<p id='feature3_mean'>Mean feature 3: " + mean_feature_3_selected + "</p>");
    $('.selected-data').append("<p id='feature4_mean'>Mean feature 4: " + mean_feature_4_selected + "</p>");
    $('.selected-data').append("<p id='feature5_mean'>Mean feature 5: " + mean_feature_5_selected + "</p>");
    $('.selected-data').append("<p id='feature6_mean'>Mean feature 6: " + mean_feature_6_selected + "</p>");

    // Close off column of selected data
    $('.inspector-row').append("</div>");
    $('.inspector-row').append("<div class='columns small-6 all-data'>");

    $('.all-data').append("<h4>All data</h4>");
    all_data = d3.selectAll('.dot').data();
    mean_tsnex = d3.mean(all_data, function(d) { return d.tsneX})
    mean_tsney = d3.mean(all_data, function(d) { return d.tsneY})
    mean_feature_1_all = d3.mean(all_data, function(d) { return d.expression[0]})
    mean_feature_2_all = d3.mean(all_data, function(d) { return d.expression[1]})
    mean_feature_3_all = d3.mean(all_data, function(d) { return d.expression[2]})
    mean_feature_4_all = d3.mean(all_data, function(d) { return d.expression[3]})
    mean_feature_5_all = d3.mean(all_data, function(d) { return d.expression[4]})
    mean_feature_6_all = d3.mean(all_data, function(d) { return d.expression[5]})
    $('.all-data').append("<p id='tsnex_mean'>Mean tsnex: " + mean_tsnex + "</p>");
    $('.all-data').append("<p id='tsney_mean'>Mean tsney: " + mean_tsney + "</p>");
    $('.all-data').append("<p id='feature1_mean'>Mean feature 1: " + mean_feature_1_all + "</p>");
    $('.all-data').append("<p id='feature2_mean'>Mean feature 2: " + mean_feature_2_all + "</p>");
    $('.all-data').append("<p id='feature3_mean'>Mean feature 3: " + mean_feature_3_all + "</p>");
    $('.all-data').append("<p id='feature4_mean'>Mean feature 4: " + mean_feature_4_all + "</p>");
    $('.all-data').append("<p id='feature5_mean'>Mean feature 5: " + mean_feature_5_all + "</p>");
    $('.all-data').append("<p id='feature6_mean'>Mean feature 6: " + mean_feature_6_all + "</p>");
    // Close off column all data
    $('.inspector-row').append("</div>");
    // Close off row
    $('.inspector-row').append("</div>");
    feature1_data = [];
    for(var i = 0;i<selected_data.length;i++) {
      feature1_data.push(selected_data[i].expression[0]);
    }
    drawKDE(feature1_data);
  }
}

function drawKDE(current_data){
  x_scale_inspector = d3.scale.linear()
    .domain([0, 1])
    .range([0, width_inspector]);

  y_scale_inspector = d3.scale.linear()
    .domain([0, 1])
    .range([height_inspector, 0]);

  xAxis_inspector = d3.svg.axis()
      .scale(x_scale_inspector)
      .orient("bottom");

  yAxis_inspector = d3.svg.axis()
      .scale(y_scale_inspector)
      .orient("left");

  inspector_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height_inspector + ")")
    .call(xAxis_inspector)
  .append("text")
    .attr("class", "label")
    .attr("x", width_inspector)
    .attr("y", -6)
    .style("text-anchor", "end");

  inspector_svg.append("g")
    .attr("class", "y axis")
    .call(yAxis_inspector);

  numHistBins = Math.ceil(Math.sqrt(current_data.length));

  histogram = d3.layout.histogram()
    .frequency(false)
    .bins(numHistBins);

  var histogram_data = histogram(current_data);

  inspector_svg.selectAll(".bar")
      .data(histogram_data)
    .enter().insert("rect", ".axis")
      .attr("class", "bar")
      .attr("x", function(d) { return x_scale_inspector(d.x) + 1; })
      .attr("y", function(d) { return y_scale_inspector(d.y); })
      .attr("width", x_scale_inspector(histogram_data[0].dx + histogram_data[0].x) - x_scale_inspector(histogram_data[0].x) - 1)
      .attr("height", function(d) { return height_inspector - y_scale_inspector(d.y); });

  kde = kernelDensityEstimator(epanechnikovKernel(1), x_scale_inspector.ticks(100));

  inspector_svg.append("path")
    .datum(kde(current_data))
    .attr("class", "line")
    .attr("d", line);
}

var line = d3.svg.line()
    .x(function(d) {
      console.log(x_scale_inspector(d[0]));
      return x_scale_inspector(d[0]);
    })
    .y(function(d) {
      console.log(y_scale_inspector(d[1]));
      return y_scale_inspector(d[1]);
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
