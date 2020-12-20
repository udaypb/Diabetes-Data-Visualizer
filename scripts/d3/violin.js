var normal = d3.randomNormal();
var basal = d3.range(100).map(d => normal());
var bolus = d3.range(100).map(d => normal());
var insu_bf = d3.range(100).map(d => normal());
var insu_lunch = d3.range(100).map(d => normal());
var insu_dinner = d3.range(100).map(d => normal());
var insu_sugartreat = d3.range(100).map(d => normal());
var insu_bedtime = d3.range(100).map(d => normal());

var carb_bf = d3.range(100).map(d => normal());
var carb_lunch = d3.range(100).map(d => normal());
var carb_dinner = d3.range(100).map(d => normal());
var carb_sugartreat = d3.range(100).map(d => normal());
var carb_bedtime = d3.range(100).map(d => normal());

var viewType = d3.select("#viewType");
var url1 = "./data/data-02_glucose.csv";
var url2 = "./data/data-02_events.csv";
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
    // var categories1 = [basal, bolus]
    // var n1 = 2
    var categories1 = [carb_bf, carb_lunch, carb_dinner, carb_sugartreat, carb_bedtime]
    var n1 = 5
    drawExtension1(categories1, n1);
  }
}


function drawExtension1(categories1, n1) {
  console.log("draw extenstion");

  var ridge = d3
    .select("#violin_plots")
    .append("svg")
    .attr("width", 500)
    .attr("height", 800);

  // Get the different categories and count them
  var width = 380;
  var height = 100;
  // Add X axis
  // var mindate = new Date(2018, 01, 31),
  // maxdate = new Date(2018, 08, 08);

  var x = d3
    .scaleLinear()
    .domain([0, 20]) // values between for month of january
    .range([0, width]);
  ridge
    .append("g")
    .attr("transform", "translate(0," + 250 + ")")
    .call(d3.axisBottom(x)); // map these the the chart width = total width minus padding at both sides


  // Create a Y scale for densities
  var y = d3
    .scaleLinear()
    .domain([0, 0.4])
    .range([height, 0]);

  // Create the Y axis for names
  var yName = d3
    .scaleBand()
    .domain([basal,bolus])
    .range([0, height])
    .paddingInner(1);
  ridge
    .append("g")
    .attr("transform", "translate(0," + 0 + ")")
    .call(d3.axisLeft(yName));

  // Compute kernel density estimation for each column:
  var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)); // increase this 40 for more accurate density.
  var allDensity = [];
  for (i = 0; i < n1; i++) {
    key = categories1[i];
    density = kde(key);
    allDensity.push({ key: key, density: density });
  }

  // Add areas
  ridge
    .selectAll("areas")
    .data(allDensity)
    .enter()
    .append("path")
    .attr("transform", function(d) {
      return "translate(0," + (yName(d.key) - height + 50) + ")";
    })
    .datum(function(d) {
      return d.density;
    })
    .attr("fill", "#69b3a2")
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr(
      "d",
      d3
        .line()
        .curve(d3.curveBasis)
        .x(function(d) {
          return x(d[0]);
        })
        .y(function(d) {
          return y(d[1]);
        })
    );
}

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [
        x,
        d3.mean(V, function(v) {
          return kernel(x - v);
        })
      ];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
  };
}



