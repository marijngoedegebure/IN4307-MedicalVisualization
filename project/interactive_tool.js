function ClearSelection() {
    d3.selectAll('.selected').classed("selected", false).style("fill", "black");;
}
