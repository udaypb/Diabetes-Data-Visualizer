var viewType = d3.select("#viewType")

viewType.on("change", displayView);
drawLevelViolins();
function displayView() {
  d3.selectAll("#violin_plots")
    .select("svg")
    .remove();

  var form = document.getElementById("viewType");
  if (form[0].checked) {
    drawLevelViolins();
  } else {
    ridgeLines();
  }
}
