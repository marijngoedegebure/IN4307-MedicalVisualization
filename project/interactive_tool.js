$('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');

function UpdateSelectionCounter() {
  $('#selected_count').remove();
  $('#selected_count_text').after("<p id='selected_count'>" + d3.selectAll('.selected')[0].length + '</p>');
}

function ClearSelection() {
    d3.selectAll('.selected').classed("selected", false).style("fill", "black");;
    $('.tooltip-content').empty();
    $('.elements-are-selected').addClass('hide').removeClass('show');
    $('.nothing-selected').addClass('show').removeClass('hide');
    UpdateSelectionCounter();
}

function UpdateTooltip() {
  $('.elements-are-selected').addClass('show').removeClass('hide');
  $('.nothing-selected').addClass('hide').removeClass('show');

  $('.tooltip-content').empty();
  var tooltip = d3.select('.tooltip-content');
  selected_data = d3.selectAll('.selected').data();
  mean_tsnex = d3.mean(selected_data, function(d) { return d.tsneX})
  mean_tsney = d3.mean(selected_data, function(d) { return d.tsneY})

  $('.tooltip-content').append("<p id='tooltip_tsnex'>" + mean_tsnex + "</p>");
  $('.tooltip-content').append("<p id='tooltip_tsney'>" + mean_tsney + "</p>");
}
