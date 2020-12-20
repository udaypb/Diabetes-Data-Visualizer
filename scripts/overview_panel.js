var groupedData = {};
var svg;
var eventsByDate = {};
var startDate='';
function renderOverview(startDate) {
    //default width
    let width = 1100;
    // flowing in from the detailed_view.js file
    let height = overViewHeight//500;
    let numDays = 14; //14 by default
    //number of days by default, change when when button click
    let heightPerDay = height / numDays; 
    let daysData = daysDataFilter(startDate, numDays, groupedData);
    // console.log(daysData)
    let dayGroups = svg.selectAll('.day')
        .data(daysData, d => d.date);
    dayGroups.exit().remove();
    let dayGroupsEnter = dayGroups.enter()
        .append('g')
        .attr('class', 'day')
        .attr('id',function(d){return 'rect-'+d.date})
        .attr('date', d => d.date);
    dayGroupsEnter.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width) //width of the container
        .attr('height', heightPerDay)
        .attr('fill', '#000')
        .attr('opacity', 0)
        .on('mouseover', (d, i, element) => {
            d3.select(element[i]).attr('opacity', 0.05);
        })
        .on('mouseout', (d, i, element) => {
            if (this.inDetailView !== d.date) {
                d3.select(element[i]).attr('opacity', 0.00);
            }
        }).on('click', (d, i, element) => {
            // console.log("This day was selected");
            // console.log(d.date);
            activeDate = d.date;
            d3.select('#date-title').html(d.date);
            drawInnerChart(d.events, d.insulinEvents, d.fastActing, d.slowActing)
        });
    //append date-time element for time ticks
    dayGroupsEnter.append('g')
        .attr('class', 'date-time');
    
    //process the day groups and go add objects
    dayGroupsEnter.each((d, i, element) => {
        let s = d3.select(element[i]); //pass the current element, select the rectangle
        let y = heightPerDay / 2;
        s.attr('text-anchor', 'start')
            .attr('dominant-baseline', 'central');
        s.append('text')
            .attr('class', 'date')
            .attr('transform', `translate(8, ${y})`)
            .text(d.date)
            .attr('font-size', '0.60em');
    });
    Xparameters(14);
    dayGroupsEnter.merge(dayGroups)
        .transition()
        .attr('transform', (d, i) => `translate(0, ${heightPerDay * i})`)
        .each((d, i, dom) => {
            showDataForDay(d.date, d3.select(dom[i]), i, heightPerDay / 2, groupedData, width);
            showEventForDay(d.date, d3.select(dom[i]), i, heightPerDay / 2, eventsByDate, width);
        });
}

var eventsData = null;
/**
 * render event renders meal events at day level
 * @param {*} start 
 */
function renderEventsOnOverview(start) {

    let numDays = 14;  //same for cgm data
    //have to get the 14 days worht of data starting from start date into an array
    let data = [];
    let stDate = moment(start);
    let i = 0
    // console.log(stDate)
    while (i < numDays) {
        let dayStr = stDate.format('YYYY-MM-DD');
        if (eventsByDate[dayStr]) {
            data.push(eventsByDate[dayStr])
        }
        stDate.add(1, 'days');
        i += 1
    }
    //day to event:
    let events = []
    events = data.reduce((event, d) =>
        event.concat(d.events), []);
}

/**
 * read dataset reads the global data files and calls render
 * function
 */
function readDataset(){
    //step one : read data from glucose csv and preprocess:
    d3.csv('../data/'+currActive_dataset+'glucose.csv', function (data) {
        data.map(function (d) {
            d.time = moment(d.time);
            d.value = parseFloat(d.glucoseReading);
        });

        //step two : group this data day wise:
        groupedData = {};
        const maxDT = ''
        const day = moment(data[0].time);


        day.hour(0);
        day.minute(0);
        day.second(0);
        day.millisecond(0);
        while (day < data[data.length - 1].time) {
            const dayStr = day.format('YYYY-MM-DD');
            groupedData[dayStr] = {
                date: dayStr,
                events: [],
                insulinEvents: [],
                fastActing:[],
                slowActing:[]
            };
            day.add(1, 'days');
        }
        data.forEach((d) => {
            const date = moment(d.time);
            const dateStr = date.format('YYYY-MM-DD');
            if (d.source != 'nightscout') {
                groupedData[dateStr].events.push(d);
            }
        });
        //prepare the view for the rendering:
        d3.select('#overview-container svg').remove();
        svg = d3.select('#overview-container').append('svg');
        svg.attr('width', "100%").attr('height', overViewHeight);
        // step three : get events data and generate by date data:
        d3.csv('../data/'+currActive_dataset+'events.csv', function (eventData) {
            eventsData = eventData;
            eventsData.map(function (d) {
                let tm='';
                if (!d.time || d.time == null) {
                    if (d.event == 'Breakfast') {
                        tm = '';
                    } else if (d.event == 'Lunch') {
                        tm = '13:00:00';
                    } else {
                        tm = '19:30:00';
                    }
                }else{
                    tm=moment.duration(parseFloat(d.time), 'h').format('HH:mm');
                }

                let timeDate=d.date+' '+tm;
                // console.log('event time date for the events date ',timeDate, d.time)
                d.time = moment(timeDate);
                d.value = parseFloat(d.glucose);
            });
            // console.log("@@@@@Events Data@@@");
            // console.log(eventsData);
            eventsData.forEach((d) => {
                const date = moment(d.time);
                const dateStr = date.format('YYYY-MM-DD');
                // console.log(dateStr);
                if (dateStr in groupedData) {
                    groupedData[dateStr].insulinEvents.push(d);
                }
            });
            //group data by days:
            let data = eventData;
            eventsByDate = {};
            data.map(function (d) {
                const dayStr = moment(d['date']).format('YYYY-MM-DD');
                d['date'] = moment(d['date']);
                d['time'] = moment(d['time']);

                if (!eventsByDate[dayStr]) {
                    eventsByDate[dayStr] = {
                        date: dayStr,
                        events: [],
                    };
                }
                eventsByDate[dayStr].events.push(d)

            });
            //now call render overview;
            startDate=data[0].time;
            renderOverview(data[0].time);
            drawDetailedView();
        });
        d3.csv('../data/'+currActive_dataset+'fast.csv', function (fastData) {
            fastData.map(function (d) {
                let tm = moment.duration(parseFloat(d.time), 'h').format('HH:mm');
                let timeDate=d.date+' '+tm;
                // console.log('event time date for the events date ',timeDate, d.time)
                d.time = moment(timeDate);
                d.value = parseFloat(d.value);
            });
            fastData.forEach((d) => {
                const date = moment(d.time);
                const dateStr = date.format('YYYY-MM-DD');
                // console.log(dateStr);
                if (dateStr in groupedData) {
                    groupedData[dateStr].fastActing.push(d);
                }
            });
        });

        d3.csv('../data/'+currActive_dataset+'slow.csv', function (fastData) {
            fastData.map(function (d) {
                let tm = moment.duration(parseFloat(d.time), 'h').format('HH:mm');
                let timeDate=d.date+' '+tm;
                // console.log('event time date for the events date ',timeDate, d.time)
                d.time = moment(timeDate);
                d.value = parseFloat(d.value);
            });

            fastData.forEach((d) => {
                const date = moment(d.time);
                const dateStr = date.format('YYYY-MM-DD');
                // console.log(dateStr);
                if (dateStr in groupedData) {
                    groupedData[dateStr].slowActing.push(d);
                }
            });
        });

    });
}

var params = []; //global align parameters
function Xparameters(numDays) {
    for (let i = 0; i < numDays; i += 1) {
        params.push({
            compartment: [{
                start: 0,
                end: 86400 + 1,
                offset: 0.0,
                scale: 1.0,
            }],
            alignFailed: false,
        });
    }
}
function getX(sec, nthDay, width) {
    const param = params[nthDay];
    const p = param.compartment.find(d => sec >= d.start && sec < d.end);

    let pos = sec * (width / 86400); //divide width by total seconds of day

    pos *= p.scale;
    pos += p.offset;
    return pos + 80; //padding of 200
}

function alignData(eventName,eventNumber){
    //eventNumber : breakfast - /4 , lunch /2 , dinner - 3/4
    renderOverview(startDate);
    if(eventName=='-1'){
        return;
    }
    let eventPos=(parseFloat($('#overview-container svg').width())/4)*eventNumber;
    let dates=[]
    d3.selectAll('.day')._groups[0].forEach((d)=>dates.push(d3.select(d).attr('date')));
    console.log(dates);
    dates.map(function(date,i){
        let id=$(`.event-${date}-${eventName}`).attr('id');
        if(id){
        let currX = parseFloat(id.split('$')[0])
        let currY=parseFloat(id.split('$')[1])
        let xDiff=eventPos-currX;

        updateEventPositions('Breakfast',xDiff,date);
        updateEventPositions('Lunch',xDiff,date);
        updateEventPositions('Dinner',xDiff,date);

        //update time ticks:
        console.log('time ticls for date',date)
        $(d3.select('#rect-'+date)).find('.date-time').each(function(d){
            console.log(d)
        });
        let allCircles=d3.selectAll('.circle-'+date)._groups[0];
        allCircles.forEach(function(c){
            let old=c['cx']['baseVal'].value
            d3.select(c).transition().attr('cx',old+xDiff);
        });
    }
    });
}

/**
 * @typedef {*} NewType
 */

/**
 * 
 * @param {String} eventName 
 * @param {Int} posNum 
 * @param {Moment date time} date 
 * 
 * This function updates event positions based on the
 * alignment selected
 */
function updateEventPositions(eventName,posNum,date){
    let id=$(`.event-${date}-${eventName}`).attr('id');
    if(id){
    let currX = parseFloat(id.split('$')[0])
    let currY=parseFloat(id.split('$')[1])
    d3.select(`.event-${date}-${eventName}`).transition().attr('transform', `translate(${currX+posNum}, ${currY})`);
    //update id
    d3.select(`.event-${date}-${eventName}`).attr('id',(currX+posNum)+'$'+currY);
    }
}

/**
 * 
 * @param {moment date time obj} date 
 * @param {The main canvas} svg 
 * @param {Integer} day 
 * @param {Any} yValue 
 * @param {Array of Objects} data 
 * @param {Integer} width 
 * 
 * Shows events at day level
 */
function showEventForDay(date, svg, day, yValue, data, width) {

    let dataForDay = data[date].events; //get events
    let rect = svg.selectAll('path').data(dataForDay);

    // console.log('plotting for event', dataForDay)
    let rectEnter = rect.enter().append('path')
        .attr('d', d3.symbol().type(d3.symbolTriangle))
        .attr('class', function(d){return 'event-'+date+'-'+d.event})
        .attr('transform', `translate(0, ${yValue})`)
        .attr('id', (d)=>{return getX(getSecondFromDay(moment(d.time)), day, width)+'$'+yValue})
        .attr('fill', function (d) {
            if (d.time) {
                return '#1c5c14';
            }
            return 'white';
        });
    let tooltip = d3.select('#tooltip');

    rectEnter.on('mouseover', function (d) {
        //creating tooltip:
        let str = `<b> Meal : </b> ${d.event} <br>
                <b> Glucose (mg/dL): </b> ${d.glucose} <br>
                <b> Time : </b> ${d.time} 
        `;
        tooltip.html(str)
            .style('left', `${d3.event.pageX + 15}px`)
            .style('top', `${d3.event.pageY - 28}px`)
            .style('opacity', 1);
    }).on('mouseout', function () {
        tooltip.style('opacity', 0);
    });
    rectEnter.merge(rect)
        .transition()
        .attr('fill', function (d) {
            if (d.event) {
                return '#1c5c14';
            }
            return '#1583ea';
        })
        .attr('opacity', 1)
        .attr('stroke-opacity', 1).attr('transform', (d) => `translate(${getX(getSecondFromDay(moment(d.time)), day, width)}, ${yValue})`);
}

function showDataForDay(date, svg, day, yValue, data, width) {
    let dataForDay = data[date].events; //get events
    let circle = svg.selectAll('circle').data(dataForDay);
    let circleEnter = circle.enter().append('circle')
        .attr('r', 2)
        .attr('class','circle-'+date)
        .attr('cx', d => getX(getSecondFromDay(d.time), day, width))
        .attr('cy', yValue);

    circleEnter.merge(circle)
        .transition()
        .attr('cx', d => getX(getSecondFromDay(d.time), day, width))
        .attr('cy', d => yValue - ((d.value / 30) + 0))
        .attr('fill', (d) => {
            if (d.value > 180) return '#8a84d4';
            else if (d.value > 70) return '#82d6c3';
            else if (d.value > 0) return '#d95f02';
            return this.colors[3];
        })
        .attr('opacity', () => {
            return 1.0;
        });
    //Show time-ticks:
    //no need to configure
    let ticks = 12; 
    let hours = 24 / ticks;
    let tickArray = [];
    for (let i = 0; i <= ticks; i += 1) {
        let label = hours * i;
        let seconds = i * hours * 3600;
        tickArray.push({
            toShow: label.toString() + ':00',
            second: seconds,
        });
    }
    tickArray[ticks].sec -= 1;

    //add ticks:
    let lines = svg.selectAll('.date-time')
        .data(tickArray, d => d.toShow);
    let linesEntered = lines.enter()
        .append('g')
        .attr('class', 'date-time')
        .attr('font-size', 12)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${getX(d.second, day, width)}, ${yValue})`);
    linesEntered.append('line')
        .attr('y1', '-2')
        .attr('y2', '3')
        .attr('stroke', '#000');
    linesEntered.append('text')
        .attr('fill', '#000')
        .attr('y', 9)
        .text(d => d.toShow);
}

/**
 * Returns an array of days data,
 * Takes in grouped data as data parameter
 *
 */
function daysDataFilter(start, numDays, data) {
    let dataDays = [];
    for (let i = 0; i < numDays; i += 1) {
        let day = moment(start);
        day.add(i, 'days');
        let dayStr = day.format('YYYY-MM-DD');
        let dayData = data[dayStr];

        if (dayData) {
            dataDays.push(dayData);
        }
    }
    return dataDays;
}

readDataset();