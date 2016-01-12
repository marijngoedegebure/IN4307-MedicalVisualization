var mode = 'Clusters';

$('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');

function UpdateSelectionCounter() {
  $('#selected_count').remove();
  $('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');
}

function ClearSelection() {
    d3.selectAll('.selected').classed("selected", false).style("fill", "black");;
    $('.inspector-content').empty();
    hideInspector();
    UpdateSelectionCounter();
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
    $('.inspector-content').empty();
    var tooltip = d3.select('.tooltip-content');
    $('.inspector-content').append("<p id='current_mode'>" + mode + "</p>");


    selected_data = d3.selectAll('.selected').data();
    mean_tsnex = d3.mean(selected_data, function(d) { return d.tsneX})
    mean_tsney = d3.mean(selected_data, function(d) { return d.tsneY})

    $('.inspector-content').append("<p id='tsnex_mean'>" + mean_tsnex + "</p>");
    $('.inspector-content').append("<p id='tsney_mean'>" + mean_tsney + "</p>");
  }
}

function GetMode() {
  return mode;
}

function SwitchModes(new_mode) {
  mode = new_mode;
  reFillPoints();
  UpdateInspector();
}
