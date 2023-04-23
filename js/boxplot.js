votes_domain = [0,2500000]

function boxplot(){// set the dimensions and margins of the graph


  var rect = d3.select("#boxplot").node().getBoundingClientRect(); //the node() function get the DOM element represented by the selection (d3.select)
        histoWidth = rect.width-5;
        histoHeight = rect.height-5;

  console.log("boxolot rect", rect)

  var margin = {top: 10, right: 40, bottom: 40, left: 0},
        width = histoWidth - margin.left - margin.right,
        height = histoHeight - margin.top - margin.bottom;

  console.log(margin, width)

  // append the svg object to the body of the page
  var svg = d3.select("#boxplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  var data = votesDimension.bottom(Infinity).map(a => +a.votes);

  var data_sorted = data.sort(d3.ascending)
  var q1 = d3.quantile(data_sorted, .25)
  var median = d3.quantile(data_sorted, .5)
  var q3 = d3.quantile(data_sorted, .75)
  var interQuantileRange = q3 - q1
  var min = q1 - 1.5 * interQuantileRange
  min = min < 0 ? 0:min
  var max = q1 + 1.5 * interQuantileRange
  max = max>votes_domain[1] ? votes_domain[1] : max



  // Show the Y scale
  // votes_domain
  y_boxplot = d3.scaleLinear()
    .domain(votes_domain)
    .range([height, 0]);
  //svg.call(d3.axisLeft(y))
  var y = y_boxplot

  

  boxplot_axis = svg.append("g")
  .attr("transform", "translate("+(histoWidth-margin.right)+",0)")
  .call(
    d3.axisRight(y_boxplot)
    .tickFormat(function (d) { if ((d / 1000) >= 1) {  d = d / 1000 + "K";} return d;})
  )

  // a few features for the box
  var center = histoWidth/2-(margin.right/2)
  var box_width = histoWidth-margin.right-10

  // Show the main vertical line
  svg
  .append("line")
    .attr("class", "vline")
    .attr("x1", center)
    .attr("x2", center)
    .attr("y1", y(min) )
    .attr("y2", y(max) )
    .attr("stroke", "black")

  // Show the box
  svg
  .append("rect")
    .attr("class", "box")
    .attr("x", center - box_width/2)
    .attr("y", y(q3) )
    .attr("height", (y(q1)-y(q3)) )
    .attr("width", box_width )
    .attr("stroke", "black")
    .style("fill", "#ececec")

  // show median, min and max horizontal lines
  svg
  .selectAll("toto")
  .data([min, median, max])
  .enter()
  .append("line")
    .attr("class","toto")
    .attr("x1", center-box_width/2)
    .attr("x2", center+box_width/2)
    .attr("y1", function(d){ return(y(d))} )
    .attr("y2", function(d){ return(y(d))} )
    .attr("stroke", "black")


    brush_boxplot = d3.brushY()                 // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width, height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("brush", boxplotCallBackUpdateData)

     svg
      .append("g")
        .attr("class", "brush")
        .call(brush_boxplot);

    svg.on("dblclick", d => {
      votes_domain = [0,2500000]    
      d3.event.preventDefault();
      boxplot_update()
      movies.update()
              
    });

    svg.append("text")
          .attr("fill", "black")   
          //.attr("class", "lines_x_label")          
          .attr("transform",
                "translate(" + width/2 + " ," + (height+ margin.top + margin.bottom-20)+ ")")
          .style("text-anchor", "middle")
          .text("N° Votes");

}


function boxplot_update(){
   
  var rect = d3.select("#boxplot").node().getBoundingClientRect(); //the node() function get the DOM element represented by the selection (d3.select)
        histoWidth = rect.width-5;
        histoHeight = rect.height-5;

  var margin = {top: 10, right: 40, bottom: 40, left: 0},
        width = histoWidth - margin.left - margin.right,
        height = histoHeight - margin.top - margin.bottom;

  var svg = d3.select("#boxplot").select("g")

  //var data2 = ndx.allFiltered().filter(d => )
  if(tooltip_active){
    var data = ndx.allFiltered().flatMap(o => o[tooltip_active]==tooltip_value ? [o.votes] : []);
  }else{
    var data = votesDimension.bottom(Infinity).map(a => +a.votes);
  }
  



  
  //console.log("sata box", data2)

  var q1 = d3.quantile(data, .25)
  var median = d3.quantile(data, .5)
  var q3 = d3.quantile(data, .75)
  var interQuantileRange = q3 - q1
  var min = q1 - 1.5 * interQuantileRange
  //min = min < 0 ? 0:min
  min = min < 0 ? 0:min
  var max = q1 + 1.5 * interQuantileRange
  //max = max>votes_domain[1] ? votes_domain[1] : max
  max = max>2500000 ? 2500000 : max


  // Show the Y scale
  y_boxplot = d3.scaleLinear()
    .domain([0,2500000])
    .range([height, 0]);
  


  //boxplot_axis.call(
  //  d3.axisRight(y_boxplot)
  //  .tickFormat(function (d) { if ((d / 1000) >= 1) {  d = d / 1000 + "K";} return d;})
  // )

  var y = y_boxplot

  // a few features for the box
  var center = histoWidth/2-(margin.right/2)
  var box_width = histoWidth-margin.right-10



  colorbox =  tooltip_active ? "#3379B5" : "#ececee"

  // Show the main vertical line
  var line = svg.select(".vline")
  line
    .attr("class", "vline")
    .attr("x1", center)
    .attr("x2", center)
    .attr("y1", y(min) )
    .attr("y2", y(max) )
    .attr("stroke", "black")

  // Show the box
  var box = svg.select("rect")
  box
    .attr("x", center - box_width/2)
    .attr("y", y(q3) )
    .attr("height", (y(q1)-y(q3)) )
    .attr("width", box_width )
    .attr("stroke", "black")
    .style("fill", colorbox)

  // show median, min and max horizontal lines
  svg
  .selectAll(".toto")
  .data([min, median, max])
    .attr("class","toto")
    .attr("x1", center-box_width/2)
    .attr("x2", center+box_width/2)
    .attr("y1", function(d){ return(y(d))} )
    .attr("y2", function(d){ return(y(d))} )
    .attr("stroke", "black")

}


function boxplotCallBackUpdateData(){

  extent = d3.event.selection

  if(extent){
      votes_domain = [y_boxplot.invert(extent[1]),y_boxplot.invert(extent[0])]
      //d3.select("#boxplot").select(".brush").call(brush_boxplot.move, null) // This remove the grey brush area as soon as the selection has been done
    }
   boxplot_update()
   movies.update()
   d3.select("#brushScatter").select(".brush").call(movies.getBrush().move, null)
}