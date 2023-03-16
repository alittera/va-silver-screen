let x_horizontalbar,y_horizontalbar,property_horizontalbar;

class horizontalBarPlot extends Plot {
  constructor() {
    
  super("#horizontalbar", {top: 0, right: 20, bottom: 20, left: 120},29,40);
  console.log("horizontalbar")
  this.aggregator_limit_start = 0
  this.aggregator_limit_end = 100000
  this.length_limit = this.aggregator_limit_end-this.aggregator_limit_start
  this.horizontalbar_property = "director1"
  this.sortorder = true
  this.sortname = true
  this.barolot_percentage = false

  this.height = 100

  this.svg.append("g")
      .attr("class", "bar_y_scale")

  this.svg.append("g")
    .attr("class", "bar_x_scale")


  this.svg_head = d3.select("#horizontalbar_stick_head")
  .append("svg")
    .attr("id", "horizontalbarsvg_head")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height",40)
  .append("g")
    .attr("transform",
          "translate(" + this.margin.left + "," + 38 + ")");

  this.svg_head.append("g")
    .attr("class", "barh_x_scale")

  d3.select("#percent_button").style("left", this.margin.left-35+"px")

  this.property =  d3.select("#horizontalbar_dropdown").property("value") 
  this.property_reduce =  d3.select("#horizontalbar_dropdown_reduce").property("value") 
  this.sortorder = d3.select('#sortorder').property("checked")
  this.sortname = d3.select('#sortname').property("checked")
  this.reduce_action = d3.select('#barplot_action').property("checked")
  this.percentage = d3.select('#barolot_percentage').property("checked")


  d3.select("#horizontalbar_dropdown").on("change", function(d) {
    horizontalbar.property = d3.select(this).property("value")
    horizontalbar.update()
  })

  d3.select("#horizontalbar_dropdown_reduce").on("change", function(d) {
    horizontalbar.property_reduce = d3.select(this).property("value")
    horizontalbar.update()
  })

   d3.select('#sortorder').on("change", function(d) {
    horizontalbar.sortorder = d3.select(this).property("checked")
    horizontalbar.update()
  })


  d3.select('#sortname').on("change", function(d) {
    horizontalbar.sortname = d3.select(this).property("checked")
    horizontalbar.update()
  })

  d3.select('#barolot_percentage').on("change", function(d) {
    horizontalbar.percentage = d3.select(this).property("checked")
    horizontalbar.update()
  })

  d3.select('#barplot_action').on("change", function(d) {
    horizontalbar.reduce_action = d3.select(this).property("checked")
    horizontalbar.update()
  })

}

actor_reduce(films_by_aggregator){
  var stack = d3.stack().keys(genres)//.order(d3.stackOrderReverse)
    //var actor=films_by_aggregator[0][this.property]

    switch (this.property_reduce) {
      case 'sum':
        var sort_n = films_by_aggregator.length
        var sort_nf = films_by_aggregator.filter(function(d) { return genres_sort.includes(d.genre1)  }).length
        //console.log("aggregatoesum", films_by_aggregator)
        if (this.percentage){
          var films_by_aggregator_percentage_r =  d3.rollup(films_by_aggregator, z=> z.length/sort_n*100, d => d.genre1)
        }else{
        
          var films_by_aggregator_percentage_r =  d3.rollup(films_by_aggregator, z=> z.length, d => d.genre1)
        }
        break;
        
      default:
        

        if(this.reduce_action){

          var sort_n = d3.sum(films_by_aggregator, d => d[this.property_reduce])
          var sort_nf = d3.sum(films_by_aggregator.filter(function(d) { return genres_sort.includes(d.genre1)  }), d => d[this.property_reduce])
          
          if (this.percentage){
            var films_by_aggregator_percentage_r =  d3.rollup(films_by_aggregator, v => d3.sum(v, d => d[this.property_reduce])/sort_n*100, d => d.genre1)
          }else{
          
            var films_by_aggregator_percentage_r =  d3.rollup(films_by_aggregator, v => d3.sum(v, d => d[this.property_reduce]), d => d.genre1)
            console.log("sum-n%", films_by_aggregator_percentage_r)
          }
        }else{

          var sort_n = d3.mean(films_by_aggregator, d => d[this.property_reduce])
          var sort_nf = d3.mean(films_by_aggregator.filter(function(d) { return genres_sort.includes(d.genre1)  }), d => d[this.property_reduce])
          //console.log("aggregatoesum", films_by_aggregator, sort_n, sort_nf)
          if (this.percentage){
            var films_by_aggregator_percentage_r =  d3.rollup(films_by_aggregator, v => d3.sum(v, d => d[this.property_reduce])/sort_n*100/films_by_aggregator.length, d => d.genre1)
          }else{

          
            var films_by_aggregator_percentage_r =  d3.rollup(films_by_aggregator, v => d3.sum(v, d => d[this.property_reduce]/films_by_aggregator.length), d => d.genre1)
          }
          

        }


  }

    var films_by_aggregator_percentage = [Object.fromEntries(films_by_aggregator_percentage_r)]

    //console.log("films_by_aggregator_percentage", films_by_aggregator_percentage)
    var stacked_film_by_actor = stack(films_by_aggregator_percentage);

    this.max = ((this.max < sort_n) ? sort_n : this.max); 

    return {stack:stacked_film_by_actor, sort_n:sort_nf}
  }

update(){
console.log("horizontalbar_update")

  this.update_button()
  this.max = 0

  var data2 = Array.from(d3.rollup(ndx.allFiltered(), a => this.actor_reduce(a), d => d[this.property]))
  

  if(!this.sortname && this.sortorder){
    this.ordfunc = (a,b) => d3.ascending(a[0],b[0])
  }else if(!this.sortname && !this.sortorder){
    this.ordfunc  = (a,b) => d3.ascending(b[0],a[0])
  }if(this.sortname && this.sortorder){
    this.ordfunc  = (a,b) => d3.ascending(a[1].sort_n,b[1].sort_n)
  }else if(this.sortname && !this.sortorder){
    this.ordfunc  = (a,b) => d3.ascending(b[1].sort_n,a[1].sort_n)
  }

  data2 = data2.sort(this.ordfunc)


  if(scrollstack_stop){
    data2 = data2.slice(0).slice(-50)
  }


  


  //
    

  var name_keys = data2.map(function(value) {
    return [value[0]];
  });

  var stacked_data = data2.map(function(value) {
    return [value[0],value[1].stack];
  });



  //console.log("stacked", stacked_data)

  // if (stacked_data.length > this.length_limit){
  //   stacked_data = stacked_data.slice(this.aggregator_limit_start, this.aggregator_limit_end)
  //   name_keys = name_keys.slice(this.aggregator_limit_start, this.aggregator_limit_end)
  // }

  //console.log(name_keys.slice(0,10))
  
  this.max = this.percentage ? 100 :this.max
  

  // name_keys = name_keys_all.slice(aggregator_limit_start, aggregator_limit_end)
  // stacked_data = stacked_data_all.slice(aggregator_limit_start, aggregator_limit_end)
  // horizontalbar_max = horizontalbar_max_all


  this.height = 25*stacked_data.length


  // console.log(this.sortname,this.sortorder)
  // console.log(data2[1])
  // console.log(this.height)

  d3.select("#horizontalbarsvg").attr("height", this.height + this.margin.top + this.margin.bottom)
  

  // Add axis
  x_horizontalbar = d3.scaleLinear()
    .domain([0, this.max])
    .range([ 0,  this.width]);

  y_horizontalbar = d3.scaleBand()
      .domain(name_keys)
      .range([ this.height, 0])
      .padding([0.2])

  //this.svg = d3.select("#horizontalbarsvg").select("g")
  //this.svg_head = d3.select("#horizontalbarsvg_head").select("g")
  var y_string_limit = Math.floor(this.margin.left/6)
  var yaxis = this.svg.select(".bar_y_scale")
          .call(d3.axisLeft( y_horizontalbar).tickFormat(function(d,i){
            if(d[0].length>y_string_limit){
               return d[0].substring(0, y_string_limit)+".."
            }else{
               return d[0]
            }
           
          }
            ));
          

  this.svg.select(".bar_x_scale")
          .call(d3.axisTop(x_horizontalbar).tickSizeOuter(2));

  var ticks_n = this.max<=1000000 ? 5 : 4
  ticks_n = this.max>1000000 ? 3 : ticks_n
  this.svg_head.select(".barh_x_scale")
          .call(d3.axisTop(x_horizontalbar).tickSizeOuter(2).ticks(ticks_n));

  this.svg.select(".bar_y_scale").selectAll(".tick")
    .on("mouseenter", this.mouseover)
    //.on("mouseout",  this.mouseleave)
    .on("mouseleave", this.mouseleave)
  

   
  //selection property_ents
  var property_ents = this.svg
    .selectAll(".bar_row_name")
    .data(stacked_data, d => d[0])


  var rects = property_ents
  .selectAll("rect")
  .data(function(d) { return d[1]; })

  


  property_ents
        .attr(this.property, function(d) { return d[0]; })
        .attr("class", "bar_row_name")


  //update existing property_ents (actors, ecc.)
  rects
    .attr("y", function(d) {
        //console.log("pr",d3.select(this.parentNode).attr(property));
        return y_horizontalbar(d3.select(this.parentNode).attr(property_horizontalbar));
      })
    .attr("x", function(d) { return x_horizontalbar(d[0][0]); })
    .attr("width", function(d) { return x_horizontalbar(d[0][1])-x_horizontalbar(d[0][0]) ; })
    .attr("height", y_horizontalbar.bandwidth())
    .attr("fill", function(d){return genre_color(d.key)})

  //add deleted category back
  rects
  .enter()
        .append("rect")
        .attr("y", function(d) {
            return y_horizontalbar (d3.select(this.parentNode).attr(property_horizontalbar));
          })
        .attr("x", function(d) { return x_horizontalbar(d[0][0]); })
        .attr("width", function(d) { return x_horizontalbar(d[0][1])-x_horizontalbar(d[0][0]) ; })
        .attr("height", y_horizontalbar.bandwidth())
        .attr("fill", function(d){return genre_color(d.key)})

  
  //remove unwanted category
  rects
  .exit()
  .remove()

  //append new property_ents
    property_ents
    .enter()
      .append("g")
      .attr(property_horizontalbar, function(d) { return d[0]; })
      .attr("class", "bar_row_name")

      //.attr("fill", function(d) { console.log(d[0]);return color(d.key); }) //
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d[1]; })
      .enter()
      .append("rect")
        .attr("y", function(d) {
            //console.log(d3.select(this.parentNode).attr(property_horizontalbar))
            return y_horizontalbar(d3.select(this.parentNode).attr(property_horizontalbar));
          })
        .attr("x", function(d) { return x_horizontalbar(d[0][0]); })
        .attr("width", function(d) { return x_horizontalbar(d[0][1])-x_horizontalbar(d[0][0]) ; })
        .attr("height", y_horizontalbar.bandwidth())
        .attr("fill", function(d){return genre_color(d.key)})

  //remnove actors
    property_ents
    .exit()
    .remove()

  }

  update_button(){

    var sortorder_svg = d3.select('#sortorder-svg')
    var sortname_svg = d3.select('#sortname-svg')
    var sortaction_svg = d3.select('#barplot-actionreduce-svg')

    sortname_svg.selectAll("path").attr("visibility", "hidden")
    sortaction_svg.selectAll("path").attr("visibility", "hidden")
    //sortorder_svg.selectAll("path").attr("visibility", "hidden")

    this.reduce_action ? sortaction_svg.selectAll(".barplot_svg_sum").transition().attr("visibility", "visible") : sortaction_svg.selectAll(".barplot_svg_mean").transition().attr("visibility", "visible")

    if(this.sortname && this.sortorder){

     sortname_svg.selectAll(".sort-numeric-down").transition().attr("visibility", "visible")
      
      
    }else if(this.sortname && !this.sortorder){
      
      sortname_svg.selectAll(".sort-numeric-up").transition().attr("visibility", "visible")


      

    }if(!this.sortname && this.sortorder){
      
      sortname_svg.selectAll(".sort-alpha-up").transition().attr("visibility", "visible")
     
    }else if(!this.sortname && !this.sortorder){

       
       sortname_svg.selectAll(".sort-alpha-down").transition().attr("visibility", "visible")
      
      
      
    }

  }


    mouseover (d) {
    if(horizontalbar.get_tooltip()){
      horizontalbar.get_tooltip().remove()
    }
    horizontalbar.new_tooltip()
    horizontalbar.show_tooltip(d)
    tooltip_active=d3.select("#horizontalbar_dropdown").property("value") 
    tooltip_value=d
    movies.update()
    boxplot_update()
    if(tooltip_active==d3.select("#linesdropdown").property("value")){
       timeline.update_over()
    }
   

    }
    
    mouseleave (d) {
      horizontalbar.remove_tooltip()
      tooltip_active=false
      tooltip_value=false
      movies.update()
      boxplot_update()
      if(d3.select("#horizontalbar_dropdown").property("value") == d3.select("#linesdropdown").property("value")){
       timeline.update_over_reset()
      }
    }

}