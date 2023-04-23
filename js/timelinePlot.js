let x_timeline,y_timeline, bin_t;

class timelinePlot extends Plot {
  constructor() {
  super("#lines",{top: 10, right: 30, bottom: 20, left: 75},5,55)
      
  this.heightMargin = 60
  this.year_start = 1910
  this.year_end = 2020

  x_timeline = d3.scaleLinear()
    .domain([this.year_start, this.year_end])
    .range([ 0, this.width ]);


  this.property = d3.select("#linesdropdown").property("value")
  this.property_reduce = d3.select("#linesdropdown_reduce").property("value")
  this.reduce_action = d3.select('#timeline_action').property("checked")
  this.property_bin = d3.select("#linesdropdown_bin").property("value")



  this.brush = d3.brushX()                 // Add the brush feature using the d3.brush function
      .extent( [ [0,0], [this.width, this.height] ] ) // initialise the brush area: start at 0,0 and finishes at this.width,this.height: it means I select the whole graph area
      .on("end", this.linesCallBackUpdateData.bind(this))

  this.svg
    .append("g")
      .attr("class", "brush")
      .call(this.brush);


 // var zoom = d3.zoom()
 //      .scaleExtent([1, 2])  // This control how much you can unzoom (x0.5) and zoom (x20)
 //      .extent([[0, 0], [this.width, this.height]])
 //      .on("zoom", multiline_update_panzoom);

// this.svg.append("rect")
//       .attr("this.width", this.width)
//       .attr("this.height", this.height)
//       .style("fill", "none")
//       .style("pointer-events", "all")
//       .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
//       .call(zoom);




  this.svg.append("text")
  .attr("class", "lines_y_label")
  .attr("transform", "rotate(-90)")
  .attr("y", - this.margin.left)
  .attr("x", -150)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Value"); 

  // text label for the x axis
  // this.svg.append("text")   
  // .attr("class", "lines_x_label")          
  // .attr("transform",
  //       "translate(" + this.width/2 + " ," + (this.height+ this.margin.top + this.margin.bottom-28)+ ")")
  // .style("text-anchor", "middle")
  // .text("Year");

  var dropdownButton = d3.select("#linesdropdown")
  dropdownButton.on("change", function(d) {
      timeline.property = d3.select(this).property("value")
      timeline.update()
    })

  var dropdownButton2 = d3.select("#linesdropdown_reduce")
  dropdownButton2.on("change", function(d) {
      timeline.property_reduce = d3.select(this).property("value")
      timeline.update()
    })

  var dropdownButtonBin = d3.select("#linesdropdown_bin")
  dropdownButtonBin.on("change", function(d) {
      timeline.property_bin = d3.select(this).property("value")
      timeline.update()
    })

  d3.select('#timeline_action').on("change", function(d) {
    timeline.reduce_action = d3.select(this).property("checked")
    timeline.update()
  })


  this.xAxis = this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .attr("class", "lines_x_axis")

  this.yAxis = this.svg.append("g")
    .attr("class", "lines_y_axis")

  this.svg.on("dblclick", d => {
    this.year_start = 1910
    this.year_end = 2020
    this.svg.select(".brush").call(this.brush.move, null) // This remove the grey brush area as soon as the selection has been done
    

    yearFilter.filterRange([this.year_start,this.year_end+1])
  });

};




  linesCallBackUpdateData(){

    var extent = d3.event.selection
    if(extent){

      this.year_start = Math.round(x_timeline.invert(extent[0]))
      this.year_end = Math.round(x_timeline.invert(extent[1]))
      this.svg.select(".brush").call(this.brush.move, null) // This remove the grey brush area as soon as the selection has been done
    

      yearFilter.filterRange([this.year_start,this.year_end])
    }

}






update(){

  this.update_button()

  console.log("timeline update")
  var sorted = ndx.allFiltered().sort(function(x, y){
     return d3.ascending(x.year, y.year);
  });


  switch (this.property_reduce) {
    case 'sum':
      sumstat = d3.rollup(sorted, v => v.length, d => d[this.property], d => d.year);
      break;
    default:
      if(this.reduce_action){
        sumstat = d3.rollup(sorted, v => d3.sum(v, d => d[this.property_reduce]), d => d[this.property], d => d.year);
      }else{
        sumstat = d3.rollup(sorted, v => d3.mean(v, d => d[this.property_reduce]), d => d[this.property], d => d.year);
      }
      
  }


  var sumstat = Array.from(sumstat, ([x, y]) => ({ name: x, date: Array.from(y) }));

  var linemax = 0;
  var lines= sumstat.filter(d => d.date.length>1);
  var lines_filled;
  if(this.reduce_action){
    lines_filled= lines.map(fillgaps);
    lines_filled = lines.map(smooth);
  }else{

    lines_filled = lines.map(smooth);
  }
  

  
  //console.log(lines_filled)

  var dots = sumstat.filter(d => d.date.length<2)
  var dotmax = d3.max(dots, function(d){return +d.date[0][1]})

  
  var dotmax = (dotmax && dotmax > -1) ? dotmax : 0
  var dotlinemax = (dotmax < linemax) ? linemax : dotmax;

 

  function fillgaps(d) {
   
    var date_curr = d.date
    var lowEnd = date_curr[0][0]
    var highEnd = date_curr[date_curr.length - 1][0]
    const date_obj = Object.fromEntries(date_curr);

    //ricreo array con tutti i valori nell'intervallo e con i valori già presenti
    var date_new = [];
    
    for (var y = lowEnd; y <= highEnd; y++) {
        var year = y.toString()
        if (year in date_obj){
          var current = date_obj[year]
          date_new.push([year,current])
          linemax = ((linemax < current) ? current : linemax); 
        }else{
          date_new.push([year,0]);
        }
        
    }

    return {name:d.name, date:date_new}
  }

  function smooth(d) {
    var date_curr = d.date
    var bandwidth = parseInt(timeline.property_bin)
    const date_obj = Object.fromEntries(date_curr);

    //var bin = d3.bin().domain([timeline.year_start, timeline.year_end]);

    var date_new = [];

    var lowEnd = parseInt(date_curr[0][0])
    var highEnd = parseInt(date_curr[date_curr.length - 1][0])
    lowEnd=lowEnd-(lowEnd%bandwidth)
    highEnd= highEnd + (bandwidth-highEnd)%bandwidth

      for (var y = lowEnd; y <= highEnd;) {
        var sum = 0
        for(var x=y; x<y+bandwidth; x++){
          var year = x.toString()
          if (year in date_obj){
           sum += parseFloat(date_obj[year])
          }
          
        }
        if(lines.reduce_action){
          date_new.push([y, sum]);
          linemax = ((linemax < sum) ? sum : linemax);
        }else{
          var current = parseFloat(sum/bandwidth)
          date_new.push([y, current]);
          linemax = ((linemax < current) ? current : linemax);
        }
         
        y=y+bandwidth;    
    }

    return {name:d.name, date:date_new}
  }

  var year_start = this.year_start
  var year_end = this.year_end
  if (this.property_bin>1){
    year_start = year_start-(year_start%this.property_bin)
    year_end = year_end + ((this.property_bin-year_end)%this.property_bin)
  }
    

    x_timeline = d3.scaleLinear()
      .domain([year_start, year_end])
      .range([ 0, this.width ]);

    y_timeline = d3.scaleLinear()
      .domain([0, dotlinemax])
      .range([ this.height, 0 ]);

    if (this.year_end-this.year_start<10){
      this.xticks = this.year_end-this.year_start
    }else{
      this.xticks = 10
    }
    

    this.xAxis.call(d3.axisBottom(x_timeline).ticks(this.xticks).tickFormat(d3.format('d')));

    this.yAxis.call( d3.axisLeft(y_timeline));

    var property_reduce_text = d3.select("#linesdropdown_reduce option:checked").text()

    
    d3.select(".lines_y_label")
    .text(property_reduce_text)

    var liner = d3.line()
              //.defined(function(d) { return d[1] != 0; })
              .curve(d3.curveMonotoneX)
              .x(function(d) {  return x_timeline(d[0]); })
              .y(function(d) {  return y_timeline(d[1]); })
             

    this.update_sel = this.svg.selectAll(".line").data(lines_filled, d => d[this.property])
    this.singlepoints = this.svg.selectAll("circle").data(dots, d => d[this.property])


    this.update_sel
        .enter()
        .append("path")
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", '#377eb8')
          .attr("stroke-width", 2.0)
          .style("opacity", 0.2)
          .attr("d", function(d){
            return liner(d.date)
          }).attr('fill', 'none')
          .attr('pointer-events', 'visibleStroke')
          .on("mouseover", this.mouseover)                  
          .on("mouseleave",  this.mouseleave);

            
    this.update_sel
          .attr("d", function(d){
            return liner(d.date)
          })
          

    this.update_sel
        .exit()
        .remove()

    this.singlepoints
          .enter()
          .append("circle")
            .attr("cx", function (d) { return x_timeline(d.date[0][0]); } )
            .attr("cy", function (d) { return y_timeline(d.date[0][1]); } )
            .attr("r", 3)
            .style("fill", "#377eb8")
            .style("opacity", 0.2)
            .on("mouseover", this.mouseover)               
            .on("mouseleave",  this.mouseleave);
          //.classed("green", true)

    this.singlepoints
        //.transition()
            .attr("cx", function (d) { return x_timeline(d.date[0][0]); } )
            .attr("cy", function (d) { return y_timeline(d.date[0][1]); } )
            .attr("r", 3)
            .on("mouseover", this.mouseover)             
            .on("mouseleave",  this.mouseleave);

    this.singlepoints
          .exit()
          .remove()

  }


update_over_reset(){
  console.log("update over")
  this.update_sel = this.svg.selectAll(".line")
  this.singlepoints = this.svg.selectAll("circle")
  this.update_sel
  .attr("stroke", '#377eb8')
  .style("opacity", 0.2)

  this.singlepoints
  .attr("stroke", '#377eb8')
  .style("opacity", 0.2)
  .attr("r", 3)


}

update_over(){
  console.log("update over")
  this.update_sel = this.svg.selectAll(".line")
  this.singlepoints = this.svg.selectAll("circle")
  this.update_sel
  .style("stroke", d => {if (d.name==tooltip_value){ return "black"} else { return '#377eb8'}})
  .style("opacity", d => { if (d.name==tooltip_value){ return 1} else {return 0.01}})

  this.singlepoints
  .style("stroke", d => { if (d.name==tooltip_value){ return "black"} else {return '#377eb8'}})
  .style("opacity", d => { if ( d.name==tooltip_value){ return 1} else {return 0.01}})
  .attr("r",  d => { if (d.name==tooltip_value){ return 5} else {return 3}})

}


update_button(){


    var sortaction_svg = d3.select('#timeline-actioneduce-svg')

    sortaction_svg.selectAll("path").attr("visibility", "hidden")
    
    this.reduce_action ? sortaction_svg.selectAll(".timeline_svg_sum").transition().attr("visibility", "visible") : sortaction_svg.selectAll(".timeline_svg_mean").transition().attr("visibility", "visible")

    

  }



    mouseover (d) {
      if(timeline.get_tooltip()){
        timeline.get_tooltip().remove()
      }
      timeline.new_tooltip()
      timeline.show_tooltip(d.name)
          
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
        this.parentNode.appendChild(this);
      }
      
      mouseleave (d) {
        timeline.remove_tooltip()
        
        d3.select(this)
           .style("stroke", "#377eb8")
           .style("opacity", 0.2)
        
      }
}

