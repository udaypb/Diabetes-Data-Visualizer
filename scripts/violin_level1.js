
function drawLevelViolins(){
    
var url1 = "./data/"+ currActive_dataset +"fast.csv";
var url2 = "./data/"+ currActive_dataset +"slow.csv";
var url3 = "./data/"+ currActive_dataset +"events_breakfast.csv";
var url4 = "./data/"+ currActive_dataset +"events_lunch.csv";
var url5 = "./data/"+ currActive_dataset +"events_dinner.csv";
var url6 = "./data/"+ currActive_dataset +"fast_breakfast.csv";
var url7 = "./data/"+ currActive_dataset +"fast_lunch.csv";
var url8 = "./data/"+ currActive_dataset +"fast_dinner.csv";

var dataset = parseInt(currActive_dataset[6])
//queing the datasets 
var q = d3_queue.queue(1)
  .defer(d3.csv, url1)
  .defer(d3.csv, url2)
  .defer(d3.csv, url3)
  .defer(d3.csv, url4)
  .defer(d3.csv, url5)
  .defer(d3.csv, url6)
  .defer(d3.csv, url7)
  .defer(d3.csv, url8)
  .awaitAll(draw);


function draw(error,data){
//get the required data column 
    basal = []
    data[0].forEach(elem => {
        basal.push(elem.value)
    });
         
    bolus = []
    data[1].forEach(elem => {
        bolus.push(elem.value)
    });
    gluco_breakfast = []
    data[2].forEach(elem => {
        if(elem.glucose>0)
            gluco_breakfast.push(+elem.glucose)
    });
    gluco_lunch = []
    data[3].forEach(elem => {
        if(elem.glucose>0)
            gluco_lunch.push(+elem.glucose)
    });
    gluco_dinner = []
    data[4].forEach(elem => {
        if(elem.glucose>0)
            gluco_dinner.push(+elem.glucose)
    });
    insu_breakfast = []
    data[5].forEach(elem => {
        if(elem.value>0)
            insu_breakfast.push(elem.value)
    });
    insu_lunch = []
    data[6].forEach(elem => {
        if(elem.value>0)
            insu_lunch.push(elem.value)
    });
    insu_dinner = []
    data[7].forEach(elem => {
        if(elem.value>0)
            insu_dinner.push(elem.value)
    });

//need to sort the data arrays in order to calculate quartile functions
    basal.sort(function(a, b){return a - b});
    bolus.sort(function(a, b){return a - b}); 
    gluco_breakfast.sort(function(a, b){return a - b}); 
    gluco_lunch.sort(function(a, b){return a - b});
    gluco_dinner.sort(function(a, b){return a - b}); 
    insu_breakfast.sort(function(a, b){return a - b}); 
    insu_lunch.sort(function(a, b){return a - b});
    insu_dinner.sort(function(a, b){return a - b});
   
var viewType = d3.select('#viewType')
viewType.on("change", displayView)
drawViolins()

//to draw the basic vilon using histogram and area function
function sketchVio(domain, thresh, widthFactor){
    var violin_histo1 = d3.histogram();
        
    violin_histo1
        .domain(domain)
        .thresholds(thresh)
        .value(d => d)    
    
    var yScale1 = d3.scaleLinear()
                    .domain(domain)
                    .range([200,0])

    var area1 = d3.area()
        .x0(d => -d.length/widthFactor) 
        .x1(d => d.length/widthFactor)
        .y(d => yScale1(d.x0))   
        .curve(d3.curveCatmullRom)

    return [violin_histo1, yScale1, area1]
}
function drawViolins(){
    d3.select('.violinparent').remove()
    //the boxQuartiles funtio calculates the quartiles for drawing the box plots
    var vio = d3.select("#violin_plots").append("svg").attr("class","violinparent").attr("width","100%").attr("height",875);
        function boxQuartiles(d) {
            return [
                d3.quantile(d, .25),
                d3.quantile(d, .5),
                d3.quantile(d, .75),
                d3.quantile(d, 0),
                d3.quantile(d, 1)
            ];
        }

                
        //-----------------level 1 - basal bolus ----------------
        //below id the code to append violin chart with horizontal lines on top and bottom and text labels
        var vio1 = vio.selectAll("g.violin")
            .data([basal, bolus]).enter()    
            .append("g")
            .attr("transform",(d,i) => `translate(${50 + i * 100}, 10)`);
        
        vio1.append("line")
            .attr("x1", -10)
            .attr("y1", 0)
            .attr("x2", 10)
            .attr("y2", 0)
            .attr("stroke-width", 1)
            .style("stroke","gray");
            
        vio1.append("line")
            .attr("x1", -5)
            .attr("y1", 0)
            .attr("x2", 5)
            .attr("y2", 0)
            .attr("stroke-width", 2)
            .style("stroke","black");

        vio1.append("text")
            .text(function(d) { var quartiles = boxQuartiles(d); return d3.format(".1f")(d3.max(quartiles, function(d){ return d;})) })
            .attr("x", 15)
            .attr("y", 5).attr("font-size","10px");;

        var yScale1;  
        vio1.append("path")
            .style("stroke","black")
            .style("stroke-width", 0)
            .style("fill",(d,i) => "gray")
            .attr("d", function(d,i){
                var values = []
                if (i == 0) {
                    if (dataset == 2)
                        values = sketchVio([0, 20], [0, 3, 5, 8, 10, 12, 15, 20], 7);
                    else
                        values = sketchVio([0, 20], [0, 3, 5, 8, 10, 12, 20], 7);
                } else {
                    if (dataset == 2)
                        values = sketchVio([0, 10], [0, 3, 5, 8, 10], 7);
                    else
                        values = sketchVio([12, 18], [12, 13, 14, 15, 16, 18], 7);
                }
            var violin_histo1 = values[0]
            yScale1 = values[1]
            var area1=values[2]
                return area1(violin_histo1(d))
            })

        vio1.append("line")
            .attr("x1", -10)
            .attr("y1", 200)
            .attr("x2", 10)
            .attr("y2", 200)
            .attr("stroke-width", 1)
            .style("stroke","gray");

        vio1.append("line")
            .attr("x1", -5)
            .attr("y1", 200)
            .attr("x2", 5)
            .attr("y2", 200)
            .attr("stroke-width", 2)
            .style("stroke","black");


        vio1.append("text")
            .text(function(d,i) { return d3.format(".1f")(d3.min(d, function(d){ return d;})) })
            .attr("x", 15)
            .attr("y", 205)
            .attr("font-size","10px");

        vio1.append("text")
            .text(function(d,i) { if(i==0) return "Basal"; else return "Bolus" })
            .attr("x", -15)
            .attr("y", 225).attr("font-size","12px");
        vio.append("text")
            .text("Basal and Bolus (u)" )
            .attr("x", 40)
            .attr("y", 270);


    //white rectangles are the box plots

        var heiArr = []
        var quartiles = []
        var rects = vio.selectAll("rect")
        .data([basal,bolus])
        .enter()
        .append("rect")
        .attr("width", 8)
        .attr("fill","white")
        .style("stroke","black")
        .style("stroke-width", 1)
        .attr("height", function(d,i) {
            quartiles.push(boxQuartiles(d));
            var hei = Math.abs(yScale1(quartiles[i][2]) - yScale1(quartiles[i][0]));
            boxcentre = hei/2;
            heiArr.push(boxcentre)
            return hei;
            }
        ) 
        .attr("transform",(d,i) => `translate(${45 + i * 100},  ${100-heiArr[i]})`)
    

        // black line at median
        var horizontalLine = vio.selectAll(".whiskers")
            .data([basal, bolus])
            .enter()
            .append("line")
            .attr("x1", function(d,i){
                return 45 +i*100
            })
            .attr("y1", function(d) {
                var quartiles = boxQuartiles(d);
                return 100+quartiles[1];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 +8
            })
            .attr("y2", function(d) {
                var quartiles = boxQuartiles(d);
                return 100+quartiles[1];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");

        m = vio.selectAll(".whiskers")
            .data([basal, bolus])
            .enter();


        //25% lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100
            })
            .attr("y1", function(d,i) {
                return heiArr[i] + 100;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 -24
            })
            .attr("y2", function(d,i) {
                return heiArr[i] + 160;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 +8
            })
            .attr("y1", function(d,i) {
                return heiArr[i] + 100;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32
            })
            .attr("y2", function(d,i) {
                return heiArr[i] + 160;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none"); 


        //25% text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][0]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 + 32;
            })
            .attr("y", function(d,i) {
                return heiArr[i] + 130;
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "25%"
            })
            .attr("x", function(d,i){
                return 45 +i*100 - 40;
            })
            .attr("y", function(d,i) {
                return heiArr[i] + 130;
            })
            .attr("font-size","10px"); 


        //median lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 -24
            })
            .attr("y1", function(d,i) {
                return 80+quartiles[i][1];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 
            })
            .attr("y2", function(d,i) {
                return 100 + quartiles[i][1] ;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 8
            })
            .attr("y1", function(d,i) {
                return 100 + quartiles[i][1];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32
            })
            .attr("y2", function(d,i) {
                return 80+quartiles[i][1];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none"); 


        //median text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][1]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 +35
            })
            .attr("y", function(d,i) {
                return 80 + quartiles[i][1];
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "median"
            })
            .attr("x", function(d,i){
                return 45 +i*100 -45
            })
            .attr("y", function(d,i) {
                return 80 + quartiles[i][1];
            })
            .attr("font-size","10px");


        //75% lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 - 32
            })
            .attr("y1", function(d,i) {
                //return heiArr[i] -30;
                return 30;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 
            })
            .attr("y2", function(d,i) {
                return 100 - heiArr[i];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 32;
            })
            .attr("y1", function(d,i) {
                //return heiArr[i] -30;
                return 30;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 8;
            })
            .attr("y2", function(d,i) {
                
                return 100 - heiArr[i];
                //return 30;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none"); 


        //75% text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][1]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 + 30
            })
            .attr("y", function(d,i) {
                return 60;
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "75%"
            })
            .attr("x", function(d,i){
                return 45 +i*100 -45
            })
            .attr("y", function(d,i) {
                return 60;
            })
            .attr("font-size","10px");  
   
    // ----------------------level 2 plots -----------------
    var yBuff = 300
     var vio1 = vio.selectAll("g.violin")
            .data([insu_breakfast, insu_lunch, insu_dinner]).enter()    
            .append("g")
            .attr("transform",(d,i) => `translate(${50 + i * 100}, 310)`);
        
        vio1.append("line")
            .attr("x1", -10)
            .attr("y1", 0)
            .attr("x2", 10)
            .attr("y2", 0)
            .attr("stroke-width", 1)
            .style("stroke","gray");
            
        vio1.append("line")
            .attr("x1", -5)
            .attr("y1", 0)
            .attr("x2", 5)
            .attr("y2", 0)
            .attr("stroke-width", 2)
            .style("stroke","black");

        vio1.append("text")
            .text(function(d) { return d3.format(".1f")(d3.max(d, function(d){ return d;})) })
            .attr("x", 15)
            .attr("y", 5).attr("font-size","10px");;

        var yScale1;  
        vio1.append("path")
            .style("stroke","black")
            .style("stroke-width", 0)
            .style("fill",(d,i) => "gray")
            .attr("d", function(d,i){
            var values = []
            if (i == 0) {
                values = sketchVio([0, 20], [0, 5, 10, 15, 20], 7);
            } else {
                if (dataset == 2)
                    values = sketchVio([0, 20], [0, 5, 8, 10, 20], 7);
                else
                    values = sketchVio([0, 10], [0, 2, 4, 5, 8, 10, 20], 7);
            }
            var violin_histo1 = values[0]
            yScale1 = values[1]
            var area1=values[2]
                return area1(violin_histo1(d))
            })

        vio1.append("line")
            .attr("x1", -10)
            .attr("y1", 200)
            .attr("x2", 10)
            .attr("y2", 200)
            .attr("stroke-width", 1)
            .style("stroke","gray");

        vio1.append("line")
            .attr("x1", -5)
            .attr("y1", 200)
            .attr("x2", 5)
            .attr("y2", 200)
            .attr("stroke-width", 2)
            .style("stroke","black");


        vio1.append("text")
            .text(function(d) { return d3.format(".1f")(d3.min(d, function(d){ return d;})) })
            .attr("x", 15)
            .attr("y", 205).attr("font-size","10px");;

        vio1.append("text")
            .text(function(d,i) { if(i==0) return "Breakfast";  if(i==1) return "Lunch"; else return "Dinner" })
            .attr("x", -15)
            .attr("y", 225).attr("font-size","12px");;
        vio.append("text")
            .text("Insulin values by Meal (u)" )
            .attr("x", 40)
            .attr("y", yBuff+270);


    //white rectangles

        var heiArr = []
        var quartiles = []
        var rects = vio.append("g").selectAll("rect")
        .data([insu_breakfast, insu_lunch, insu_dinner])
        .enter()
        .append("rect")
        .attr("width", 8)
        .attr("fill","white")
        .style("stroke","black")
        .style("stroke-width", 1)
        .attr("height", function(d,i) {
            quartiles.push(boxQuartiles(d));
            var hei = Math.abs(yScale1(boxQuartiles(d)[2]) - yScale1(boxQuartiles(d)[0]));
            boxcentre = hei/2;
            heiArr.push(boxcentre)
            return hei;
            }
        ) 
        .attr("transform",(d,i) => `translate(${45 + i * 100},  ${410-heiArr[i]})`)
        console.log(quartiles)
    // black line at median
        var horizontalLine = vio.selectAll(".whiskers")
            .data([insu_breakfast, insu_lunch, insu_dinner])
            .enter()
            .append("line")
            .attr("x1", function(d,i){
                return 45 +i*100
            })
            .attr("y1", function(d,i) {
                return yBuff+100+quartiles[i][1];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 +8
            })
            .attr("y2", function(d,i) {
                return  yBuff+100+quartiles[i][1];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
        //     .attr("fill", "none");



        m = vio.selectAll(".whiskers")
            .data([insu_breakfast, insu_lunch, insu_dinner])
            .enter();



        //25% lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100
            })
            .attr("y1", function(d,i) {
                return yBuff+ heiArr[i] + 110;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 -24
            })
            .attr("y2", function(d,i) {
                return yBuff+ heiArr[i] + 160;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 8
            })
            .attr("y1", function(d,i) {
                return yBuff+ heiArr[i] + 110;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32
            })
            .attr("y2", function(d,i) {
                return yBuff+ heiArr[i] + 160;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");


        //25% text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][0]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 + 40;
            })
            .attr("y", function(d,i) {
                return yBuff+ heiArr[i] + 130;
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "25%"
            })
            .attr("x", function(d,i){
                return 45 +i*100 - 40;
            })
            .attr("y", function(d,i) {
                return yBuff+ heiArr[i] + 130;
            })
            .attr("font-size","10px"); 


        //median lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 -24
            })
            .attr("y1", function(d,i) {
                return yBuff+80+quartiles[i][1];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 
            })
            .attr("y2", function(d,i) {
                return  yBuff+100 + quartiles[i][1] ;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 8
            })
            .attr("y1", function(d,i) {
                return yBuff+ 100 + quartiles[i][1];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32
            })
            .attr("y2", function(d,i) {
                return yBuff+80+quartiles[i][1];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none"); 


        //median text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][1]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 +35
            })
            .attr("y", function(d,i) {
                return yBuff+80 + quartiles[i][1];
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "median"
            })
            .attr("x", function(d,i){
                return 45 +i*100 -45
            })
            .attr("y", function(d,i) {
                return yBuff+80 + quartiles[i][1];
            })
            .attr("font-size","10px");


        //75% lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 -24
            })
            .attr("y1", function(d,i) {
                //return heiArr[i] -30;
                return yBuff+ heiArr[i] +15;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 
            })
            .attr("y2", function(d,i) {
                return 410-heiArr[i];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 8;
            })
            .attr("y1", function(d,i) {
                //return heiArr[i] -30;
                return 410-heiArr[i];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32;
            })
            .attr("y2", function(d,i) {
                
                return yBuff+ heiArr[i] +15;
                //return 30;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none"); 


        //75% text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][1]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 + 32
            })
            .attr("y", function(d,i) {
                return yBuff+ heiArr[i] + 35;
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "75%"
            })
            .attr("x", function(d,i){
                return 45 +i*100 - 40
            })
            .attr("y", function(d,i) {
                return yBuff+ heiArr[i] + 35;
            })
            .attr("font-size","10px");   


            //----------------------level 3 plots--------------
    var yBuff2 = 600
    var vio1 = vio.selectAll("g.violin")
           .data([gluco_breakfast, gluco_lunch, gluco_dinner]).enter()    
           .append("g")
           .attr("transform",(d,i) => `translate(${50 + i * 100}, 610)`);
       
       vio1.append("line")
           .attr("x1", -10)
           .attr("y1", 0)
           .attr("x2", 10)
           .attr("y2", 0)
           .attr("stroke-width", 1)
           .style("stroke","gray");
           
       vio1.append("line")
           .attr("x1", -5)
           .attr("y1", 0)
           .attr("x2", 5)
           .attr("y2", 0)
           .attr("stroke-width", 2)
           .style("stroke","black");

       vio1.append("text")
           .text(function(d) { return d3.format(".1f")(d3.max(d, function(d){ return d;})) })
           .attr("x", 15)
           .attr("y", 5).attr("font-size","10px");;

       var yScale1;  
       vio1.append("path")
           .style("stroke","black")
           .style("stroke-width", 0)
           .style("fill",(d,i) => "gray")
           .attr("d", function(d,i){
               var values = []
           // if(i==0)   
               values = sketchVio([0,380],[0,30,50,80,100,120,150, 170, 180, 190,200, 250,280,300, 380], 1);
           // else values = sketchVio([0,10],[0,3,5,8,10]);
           var violin_histo1 = values[0]
           yScale1 = values[1]
           var area1=values[2]
               return area1(violin_histo1(d))
           })

       vio1.append("line")
           .attr("x1", -10)
           .attr("y1", 200)
           .attr("x2", 10)
           .attr("y2", 200)
           .attr("stroke-width", 1)
           .style("stroke","gray");

       vio1.append("line")
           .attr("x1", -5)
           .attr("y1", 200)
           .attr("x2", 5)
           .attr("y2", 200)
           .attr("stroke-width", 2)
           .style("stroke","black");


       vio1.append("text")
           .text(function(d) { return d3.format(".1f")(d3.min(d, function(d){ return d;})) })
           .attr("x", 15)
           .attr("y", 205).attr("font-size","10px");;

       vio1.append("text")
           .text(function(d,i) { if(i==0) return "Breakfast";  if(i==1) return "Lunch"; else return "Dinner" })
           .attr("x", -15)
           .attr("y", 225).attr("font-size","12px");;
       vio.append("text")
           .text("Glucose values by Meals (mg/dL)" )
           .attr("x", 40)
           .attr("y", 600+270);


   //white rectangles

       var heiArr = []
       var quartiles = []
       var rects = vio.append("g").selectAll("rect")
       .data([gluco_breakfast, gluco_lunch, gluco_dinner])
       .enter()
       .append("rect")
       .attr("width", 8)
       .attr("fill","white")
       .style("stroke","black")
       .style("stroke-width", 1)
       .attr("height", function(d,i) {
           quartiles.push(boxQuartiles(d));
           var hei = Math.abs(yScale1(boxQuartiles(d)[2]) - yScale1(boxQuartiles(d)[0]));
           boxcentre = hei/2;
           heiArr.push(boxcentre)
           return hei;
           }
       ) 
       .attr("transform",(d,i) => `translate(${45 + i * 100},  ${600+100-heiArr[i]})`)

       // black line at median
       var horizontalLine = vio.selectAll(".whiskers")
           .data([gluco_breakfast, gluco_lunch, gluco_dinner])
           .enter()
           .append("line")
           .attr("x1", function(d,i){
               return 45 +i*100
           })
           .attr("y1", function(d,i) {
               // var quartiles = boxQuartiles(d);
               return yBuff/2+yBuff2/2+ 100+quartiles[i][1];
           })
           .attr("x2",function(d,i){
               return 45 +i*100 +8
           })
           .attr("y2", function(d,i) {
               // var quartiles = boxQuartiles(d);
               return yBuff/2+yBuff2/2+100+quartiles[i][1];
           })
           .attr("stroke-width", 1)
           .style("stroke","black")
           .attr("fill", "none");

       m = vio.selectAll(".whiskers")
           .data([gluco_breakfast, gluco_lunch, gluco_dinner])
           .enter();


       //25% lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100
            })
            .attr("y1", function(d,i) {
                return yBuff2+ heiArr[i] + 100;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 -24
            })
            .attr("y2", function(d,i) {
                return yBuff2+ heiArr[i] + 160;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 8
            })
            .attr("y1", function(d,i) {
                //return yBuff+ 100 + quartiles[i][0];
                return yBuff2+ heiArr[i] + 100;
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32
            })
            .attr("y2", function(d,i) {
                //return yBuff+80+quartiles[i][0];
                return yBuff2+ heiArr[i] + 160;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");


        //25% text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][0]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 + 35;
            })
            .attr("y", function(d,i) {
                return yBuff2+ heiArr[i] + 130;
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "25%"
            })
            .attr("x", function(d,i){
                return 45 +i*100 - 40;
            })
            .attr("y", function(d,i) {
                return yBuff2+ heiArr[i] + 130;
            })
            .attr("font-size","10px");


       //median lables
       m.append("line")
           .attr("x1", function(d,i){
               return 45 +i*100 -24
           })
           .attr("y1", function(d,i) {
               return yBuff2/2+yBuff/2+80+quartiles[i][1];
           })
           .attr("x2",function(d,i){
               return 45 +i*100 
           })
           .attr("y2", function(d,i) {
               return  yBuff2/2+yBuff/2+100 + quartiles[i][1] ;
           })
           .attr("stroke-width", 1)
           .style("stroke","black")
           .attr("fill", "none");
       m.append("line")
           .attr("x1", function(d,i){
               return 45 +i*100 + 8
           })
           .attr("y1", function(d,i) {
               return yBuff2/2+yBuff/2+ 100 + quartiles[i][1];
           })
           .attr("x2",function(d,i){
               return 45 +i*100 + 32
           })
           .attr("y2", function(d,i) {
               return yBuff2/2+yBuff/2+80+quartiles[i][1];
           })
           .attr("stroke-width", 1)
           .style("stroke","black")
           .attr("fill", "none"); 


       //median text
       m.append("text")
           .text(function(d,i) {
               return d3.format(".1f")(quartiles[i][1]);
           })
           .attr("x", function(d,i){
               return 45 +i*100 +35
           })
           .attr("y", function(d,i) {
               return yBuff2/2+yBuff/2+80 + quartiles[i][1];
           })
           .attr("font-size","10px");

       m.append("text")
           .text(function(d) {
               return "median"
           })
           .attr("x", function(d,i){
               return 45 +i*100 -45
           })
           .attr("y", function(d,i) {
               return yBuff2/2+yBuff/2+80 + quartiles[i][1];
           })
           .attr("font-size","10px");

       //75% lables
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 -24
            })
            .attr("y1", function(d,i) {
                //return heiArr[i] -30;
                return yBuff2+ heiArr[i];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 
            })
            .attr("y2", function(d,i) {
                return 700-heiArr[i];
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none");
        
        m.append("line")
            .attr("x1", function(d,i){
                return 45 +i*100 + 8;
            })
            .attr("y1", function(d,i) {
                //return heiArr[i] -30;
                return 700-heiArr[i];
            })
            .attr("x2",function(d,i){
                return 45 +i*100 + 32;
            })
            .attr("y2", function(d,i) {
                
                return yBuff2+ heiArr[i];
                //return 30;
            })
            .attr("stroke-width", 1)
            .style("stroke","black")
            .attr("fill", "none"); 


        //75% text
        m.append("text")
            .text(function(d,i) {
                return d3.format(".1f")(quartiles[i][1]);
            })
            .attr("x", function(d,i){
                return 45 +i*100 + 30
            })
            .attr("y", function(d,i) {
                return yBuff2+ heiArr[i] + 5;
            })
            .attr("font-size","10px");

        m.append("text")
            .text(function(d) {
                return "75%"
            })
            .attr("x", function(d,i){
                return 45 +i*100 - 42
            })
            .attr("y", function(d,i) {
                return yBuff2+ heiArr[i] + 5;
            })
            .attr("font-size","10px");    
    }
}
}