// <--------------------------- This plot shows the ridgeline view of the violin charts----------------------->
function ridgeLines() {
  // <----------------------------- The datasets are exracted where currActive_dataset has value 1 and 2 for dataset 1 and 2 switch ----------------------------->
  var url1 = "./data/" + currActive_dataset + "fast.csv";
  var url2 = "./data/" + currActive_dataset + "slow.csv";
  var url3 = "./data/" + currActive_dataset + "events_breakfast.csv";
  var url4 = "./data/" + currActive_dataset + "events_lunch.csv";
  var url5 = "./data/" + currActive_dataset + "events_dinner.csv";
  var url6 = "./data/" + currActive_dataset + "fast_breakfast.csv";
  var url7 = "./data/" + currActive_dataset + "fast_lunch.csv";
  var url8 = "./data/" + currActive_dataset + "fast_dinner.csv";

  var q = d3_queue
    .queue(1)
    .defer(d3.csv, url1)
    .defer(d3.csv, url2)
    .defer(d3.csv, url3)
    .defer(d3.csv, url4)
    .defer(d3.csv, url5)
    .defer(d3.csv, url6)
    .defer(d3.csv, url7)
    .defer(d3.csv, url8)
    .awaitAll(draw);

  // <--------------------------- This function is used to retrieve list of all columns for glucose and insulin values  ----------------------->

  function draw(error, data) {
    basal = [];
    data[0].forEach(element => {
      basal.push(element.value);
    });

    bolus = [];
    data[1].forEach(element => {
      bolus.push(element.value);
    });
    gluco_breakfast = [];
    data[2].forEach(element => {
      if (element.glucose > 0) gluco_breakfast.push(+element.glucose);
    });
    gluco_lunch = [];
    data[3].forEach(element => {
      if (element.glucose > 0) gluco_lunch.push(+element.glucose);
    });
    gluco_dinner = [];
    data[4].forEach(element => {
      if (element.glucose > 0) gluco_dinner.push(+element.glucose);
    });
    insu_breakfast = [];
    data[5].forEach(element => {
      if (element.value > 0) insu_breakfast.push(element.value);
    });
    insu_lunch = [];
    data[6].forEach(element => {
      if (element.value > 0) insu_lunch.push(element.value);
    });
    insu_dinner = [];
    data[7].forEach(element => {
      if (element.value > 0) insu_dinner.push(element.value);
    });
    d3.select(".ridgeparent").remove();
    var ridge = d3
      .select("#violin_plots")
      .append("svg")
      .attr("width", 500)
      .attr("height", 800)
      .attr("class", "ridgeparent");

    // <--------------------------- Three types are shown here for ridge plots  ----------------------->
    var type1 = [basal, bolus];
    var type2 = [insu_breakfast, insu_lunch, insu_dinner];
    var type3 = [gluco_breakfast, gluco_lunch, gluco_dinner];

    // <--------------------------- Three functions are called, each plotting ridgeline plots for the datasets ----------------------->
    drawExtension1(ridge, type1, 2);
    drawExtension2(ridge, type2, 3);
    drawExtension3(ridge, type3, 3);
  }

  function drawExtension1(ridge, type1, n1) {
    console.log("draw extenstion");

    var width = 300;
    var height = 30;
    var sub_h = 100;

    // <--------------------------- X axis has values of the insulin ----------------------->
    var x = d3
      .scaleLinear()
      .domain([0, 20])
      .range([0, width]);
    ridge
      .append("g")
      .attr("transform", "translate(" + 80 + "," + (height + sub_h) + ")")
      .call(d3.axisBottom(x));

    // <--------------------------- Y axis shows which type such as basal, bolus which are the types----------------------->
    var y = d3
      .scaleLinear()
      .domain([0, 0.1])
      .range([height, 0]);
    var names = ["Bolus", "Basal"];

    // <--------------------------- This gets all the values from the column and renames it ----------------------->
    var yName = d3
      .scaleBand()
      .domain(type1)
      .range([30, height + sub_h / 2])
      .paddingInner(1);
    ridge
      .append("g")
      .attr("transform", "translate(" + 80 + "," + sub_h / 2 + ")")
      .call(
        d3.axisLeft(yName).tickFormat(function(d, i) {
          console.log("D is : " + names[i]);
          return names[i];
        })
      );

    // <--------------------------- These are the titles for each plot ----------------------->
    ridge
      .append("text")
      .text("Basal and Bolus (u)")
      .attr("x", 140)
      .attr("y", 170);

    ridge
      .append("text")
      .text("Insulin values by Meal (u)")
      .attr("x", 130)
      .attr("y", 420);

    ridge
      .append("text")
      .text("Glucose values by Meal (mg/dL)")
      .attr("x", 100)
      .attr("y", 670);

    // <--------------------------- Each column values are taken and the kernal density estimation is done ----------------------->
    // <---------------- Link used to understand ridgeline plots: https://www.d3-graph-gallery.com/graph/ridgeline_basic.html------>
    // <--------------------------- ticks value can be changed for more accuracy to be visible ----------------------->

    var calc_density = kernel_dense(kernel_func(7), x.ticks(40));
    var final_map = [];
    for (i = 0; i < n1; i++) {
      key = type1[i];
      density = calc_density(key);
      final_map.push({ key: key, density: density });
    }

    // <--------------------------- The areas are estimated using the density values. ----------------------->

    ridge
      .selectAll("areas")
      .data(final_map)
      .enter()
      .append("path")
      .attr("transform", function(d) {
        console.log("I am entering: " + yName(d.key));
        return "translate(80," + (yName(d.key) - height + sub_h / 2) + ")";
      })
      .datum(function(d) {
        return d.density;
      })
      .attr("fill", "gray")
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

  function drawExtension2(ridge, type1, n1) {
    console.log("draw extenstion");

    var width = 300;
    var height = 30;
    var sub_h = 350;
    // <--------------------------- X axis has values of the insulin ----------------------->

    var x = d3
      .scaleLinear()
      .domain([0, 20])
      .range([0, width]);
    ridge
      .append("g")
      .attr("transform", "translate(" + 80 + "," + (height + sub_h) + ")")
      .call(d3.axisBottom(x));
    // <--------------------------- Y axis shows which type such as basal, bolus which are the types----------------------->

    var y = d3
      .scaleLinear()
      .domain([0, 0.2])
      .range([height, 0]);
    var names = ["Dinner", "Lunch", "Breakfast"];

    // <--------------------------- This gets all the values from the column and renames it ----------------------->
    var yName = d3
      .scaleBand()
      // .domain([0, 0.4])
      .domain(type1)
      .range([100, height + sub_h / 2])
      .paddingInner(1);
    ridge
      .append("g")
      .attr("transform", "translate(" + 80 + "," + sub_h / 2 + ")")
      .call(
        d3.axisLeft(yName).tickFormat(function(d, i) {
          console.log("D is : " + names[i]);
          return names[i];
        })
      );

    // <--------------------------- Each column values are taken and the kernal density estimation is done ----------------------->
    // <---------------- Link used to understand ridgeline plots: https://www.d3-graph-gallery.com/graph/ridgeline_basic.html------>
    // <--------------------------- ticks value can be changed for more accuracy to be visible ----------------------->

    var calc_density = kernel_dense(kernel_func(7), x.ticks(40));
    var final_map = [];
    for (i = 0; i < n1; i++) {
      key = type1[i];
      density = calc_density(key);
      final_map.push({ key: key, density: density });
    }

    // <--------------------------- The areas are estimated using the density values. ----------------------->
    ridge
      .selectAll("areas")
      .data(final_map)
      .enter()
      .append("path")
      .attr("transform", function(d) {
        console.log("I am entering: " + yName(d.key));
        return "translate(80," + (yName(d.key) - height + sub_h / 2) + ")";
      })
      .datum(function(d) {
        return d.density;
      })
      .attr("fill", "gray")
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

  function drawExtension3(ridge, type1, n1) {
    console.log("draw extenstion");

    var width = 300;
    var height = 250;
    var sub_h = 380;
    // <--------------------------- X axis has values of the insulin ----------------------->

    var x = d3
      .scaleLinear()
      .domain([0, 600])
      .range([0, width]);
    ridge
      .append("g")
      .attr("transform", "translate(" + 80 + "," + (height + sub_h) + ")")
      .call(d3.axisBottom(x));
    // <--------------------------- Y axis shows which type such as basal, bolus which are the types----------------------->

    var y = d3
      .scaleLinear()
      .domain([0, 0.1])
      .range([height, 0]);
    var names = ["Dinner", "Lunch", "Breakfast"];

    // <--------------------------- This gets all the values from the column and renames it ----------------------->

    var yName = d3
      .scaleBand()
      // .domain([0, 0.4])
      .domain(type1)
      .range([350, height + sub_h / 2])
      .paddingInner(1);
    ridge
      .append("g")
      .attr("transform", "translate(" + 80 + "," + sub_h / 2 + ")")
      .call(
        d3.axisLeft(yName).tickFormat(function(d, i) {
          console.log("D is : " + names[i]);
          return names[i];
        })
      );

    // <--------------------------- Each column values are taken and the kernal density estimation is done ----------------------->
    // <---------------- Link used to understand ridgeline plots: https://www.d3-graph-gallery.com/graph/ridgeline_basic.html------>
    // <--------------------------- ticks value can be changed for more accuracy to be visible ----------------------->

    var calc_density = kernel_dense(kernel_func(7), x.ticks(40));
    var final_map = [];
    for (i = 0; i < n1; i++) {
      key = type1[i];
      density = calc_density(key);
      final_map.push({ key: key, density: density });
    }

    // <--------------------------- The areas are estimated using the density values. ----------------------->
    ridge
      .selectAll("areas")
      .data(final_map)
      .enter()
      .append("path")
      .attr("transform", function(d) {
        console.log("I am entering: " + yName(d.key));
        return "translate(80," + (yName(d.key) - height + sub_h / 2) + ")";
      })
      .datum(function(d) {
        return d.density;
      })
      .attr("fill", "gray")
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
  // <-----------------------------------Calculation fo kernal density function----------------------------------->
  function kernel_dense(kernel, X) {
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
  function kernel_func(k) {
    return function(v) {
      return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
    };
  }
}
