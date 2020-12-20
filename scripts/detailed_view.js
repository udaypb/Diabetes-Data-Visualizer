var activeDate = "";
var overViewHeight = 570;
var dtview = null
var currActive_dataset = 'data-01_';

var margin = { top: 10, right: 20, bottom: 30, left: 30 },
  width = 1260 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

let default_x = [0, 24];
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// This function will act as driver function for Detailed view
// In this function the detailed viewpanel skeleton will be cleared if
// one exists already, and then a new one will be created again. 
function drawDetailedView(){
  x.domain(default_x);
  y.domain([0, 400]);

  d3.select(".detailView").remove();
  dtview = d3.select("#detailView-container")
    .append("svg")
    .attr('class', 'detailView')
    .style("width", "100%")
    .style("height", height + margin.top + margin.bottom + "px")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)

  dtview.selectAll('.x-axis')
    .data([null])
    .enter()
    .append("g")
    .attr('class', 'x-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top + height})`)
    .call(d3.axisBottom(x)
      .ticks(13));

  // Add the Y Axis
  dtview.selectAll('.y-axis')
    .data([null])
    .enter()
    .append("g")
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(d3.axisLeft(y)
      .ticks(9));

  dtview.append('text')
    .attr("x", margin.left+5)
    .attr("y", 5)
    .attr("dy", "1em")
    .text('mg/dL');

  drawInnerChart([]);
}

function getSecondFromDay(datetime) {
  const hourToSec = datetime.hour() * 3600;
  const minToSec = datetime.minute() * 60;
  const secToSec = datetime.second();

  return hourToSec + minToSec + secToSec;
}

// This function will populate four areas inside the detailed view panel skeleton.
// First one is the CGM data in for of purpule, orange and green dotted scatterplot.
// Second is the events data in the form of Triangle, with an onhover tooltip.
// The third one is the basal(Fast) acting insulin dosage given to the patient 2-3 times a day, in the form of red bars.
// And the last one is the slow acting (Bolus) dose give to the patient in the form of a blue horizontal line, specifying
// its relative effect throughout the day.
function drawInnerChart(dataForActiveDate, insulinEventsData, fastInsulinData, slowInsulinVal) {
  if (activeDate != "") {
    let tooltip = d3.select('#tooltip');

    let circle = dtview.selectAll('.valueCircle').data(dataForActiveDate);
    let circleEnter = circle.enter().append('circle')
      .attr('class', 'valueCircle')
      .attr('r', 2)
      .attr('cy', d => y(d.value))
      .on('mouseover', function (d) {
        let str = `<b> Glucose : </b> ${d.glucoseReading} <br>
          <b> Time : </b> ${d.time.format('HH:mm')} `;
        tooltip.html(str)
          .style('left', `${d3.event.pageX + 15}px`)
          .style('top', `${d3.event.pageY - 28}px`)
          .style('opacity', 1);

      }).on('mouseout',function(d){
        tooltip.style('opacity',0);
      });
;

    circleEnter.merge(circle)
      .transition()
      .attr('cx', d => x(getSecondFromDay(d.time) / 3600) + margin.left)
      .attr('cy', d => y(d.value))
      .attr('fill', (d) => {
        if (d.value > 180) return '#8a84d4';
        else if (d.value > 70) return '#82d6c3';
        else if (d.value > 0) return '#d95f02';
        return this.colors[3];
      })
      .attr('opacity', () => {
        return 1;
      });

    let tSymbol = d3.symbol().type(d3.symbolTriangle);

    let trngl = dtview.selectAll('.triangle').data(insulinEventsData);
    let trnglCenter = trngl.enter().append('path')
      .attr('d', tSymbol)
      .attr('class', 'triangle')
      .attr('transform',function (d){ return `translate(0, ${d.value})`})
      .attr('fill', 'red')
      .on('mouseover', function (d) {
        let str = `<b> Glucose : </b> ${d.value} <br>
          <b> Time : </b> ${d.time.format('HH:mm')} `;
        tooltip.html(str)
          .style('left', `${d3.event.pageX + 15}px`)
          .style('top', `${d3.event.pageY - 28}px`)
          .style('opacity', 1);

      }).on('mouseout',function(d){
        tooltip.style('opacity',0);
      });

    trnglCenter.merge(trngl)
      .transition()
      .attr('fill', function (d) {
          if (d.value) {
              return '#1c5c14';
          }
          return 'white';
      })
      .attr('opacity', 1)
      .attr('stroke-opacity', 1)
      .attr('transform', (d) => `translate(${x(getSecondFromDay(d.time) / 3600) + margin.left}, ${y(d.value)})`);

    let readings = parseInt(dataForActiveDate.length/3);
    let ind = 0;
    let dividedData = [[], [], []];
    let scaleFactor = []
    let times = [9.3, 13.0, 18.3]

    dataForActiveDate.forEach((d) => {
      if(ind < readings){
        dividedData[0].push(parseFloat(d.glucoseReading));
      } else if(ind < readings*2){
        dividedData[1].push(parseFloat(d.glucoseReading));
      } else{
        dividedData[2].push(parseFloat(d.glucoseReading));
      }
      ind += 1;
    });

    scaleFactor = [(d3.max(dividedData[0])-d3.min(dividedData[0]))/d3.mean(dividedData[0])*10
        , (d3.max(dividedData[1])-d3.min(dividedData[1]))/d3.mean(dividedData[1])*10
        , (d3.max(dividedData[2])-d3.min(dividedData[2]))/d3.mean(dividedData[2])*10
      ]

    dtview.selectAll('.fastInsulineLine').remove();
    let fastI = dtview.selectAll('.fastInsulineLine').data(fastInsulinData);
    let fastILn = fastI.enter()
      .append('line')
      .attr('class', 'fastInsulineLine');

    fastILn.merge(fastILn)
      .transition()
      .style("stroke", "red")
      .attr("x1", (d, i) => x(times[i]) + margin.left)
      .attr("y1", height+margin.top)
      .attr("x2", (d, i) => x(times[i]) + margin.left)
      .attr("y2", (d, i) => y(d.value*scaleFactor[i]));

    let slowActingInsDayVal = parseFloat(slowInsulinVal[0].value);
    times = [11.0, 18.0, 24.0]

    dtview.selectAll('.slowInsulineLine').remove();
    let slowI = dtview.selectAll('.slowInsulineLine').data(fastInsulinData);
    let slowILn = fastI.enter()
      .append('line')
      .attr('class', 'slowInsulineLine');

      slowI.merge(slowILn)
      .transition()
      .style("stroke", "#5DADE2")
      .attr("x1", (d, i) => {
        if(i==0) {return margin.left;}
        else {return x(times[i-1]) + margin.left;}
      })
      .attr("y1", (d, i) => y(slowActingInsDayVal*scaleFactor[i]))
      .attr("x2", (d, i) => x(times[i]) + margin.left)
      .attr("y2", (d, i) => y(slowActingInsDayVal*scaleFactor[i]));
  }
}