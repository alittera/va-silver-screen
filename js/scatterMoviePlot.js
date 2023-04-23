let x_movies,y_movies;
class scatterMoviePlot extends Plot {
  constructor() {

    super("#brushScatter",{top: 10, right: 0, bottom: 40, left: 65});

    this.svg.select("g")
    .attr("class","scattgroup");

    x_movies = d3.scaleLinear()
        .domain([1, 10])
        .range([ 0, this.width ]);

    this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x_movies));

      // Add Y axis
    y_movies = d3.scaleLinear()
        .domain(votes_domain) //GLOBAL VAR
        .range([ this.height, 0]);

    this.yAxis = this.svg.append("g")
        .call(
          d3.axisLeft(y_movies)
          .tickFormat(function (d) { if ((d / 1000) >= 1) {  d = d / 1000 + "K";} return d;})
        )
        .attr("class","scatter_y_axis");

    this.brush = d3.brush()                 // Add the brush feature using the d3.brush function
      .extent( [ [0,0], [this.width,this.height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("brush", this.brushCallBackUpdateData)
      .on("end", this.brushCallBackUpdateData) 

    this.svg.on("dblclick", d => {
          d3.event.preventDefault();
          votesDimension.filterAll()
          ratingDimension.filterAll()
        });

    this.svg.append('g')
    .attr("class", "brush")
    .call(this.brush)


    var clip = this.svg.append("defs").append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("width", this.width )
          .attr("height", this.height )
          .attr("x", 0)
          .attr("y", 0);

      // Create the scatter variable: where both the circles and the brush take place
    var scatter = this.svg.append('g')
        .attr("clip-path", "url(#clip)")

    this.circles = scatter.append('g')
      .selectAll("circle")
      .data(ndx.allFiltered(), d => d.title+d.writer1)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x_movies(+d.avg_vote); } )
        .attr("cy", function (d) { return y_movies(+d.votes); } )
        .attr("r", 3)
        .style("fill", function (d) { return genre_color(d.genre1) } )
        .style("opacity", 0.7)


    this.tooltip_scatter = d3.select(this.id)
        .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .attr("class", "position-absolute top-0 start-0")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "3px")


    this.circles
        .on("mouseover", this.mouseover )
        //.on("mousemove", this.mousemove_scatter.bind(this) )
        .on("mouseleave", this.mouseleave)

    this.svg.append("text")
      //.attr("class", "lines_y_label")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", - this.margin.left)
      .attr("x", -150)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of votes (popularity)"); 

      // text label for the x axis
      this.svg.append("text")
      .attr("fill", "black")   
      //.attr("class", "lines_x_label")          
      .attr("transform",
            "translate(" + this.width/2 + " ," + (this.height+ this.margin.top + this.margin.bottom-20)+ ")")
      .style("text-anchor", "middle")
      .text("Average vote");

      this.zoom = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent(votes_domain)
      .on("zoom", this.zoomed)
      
      //svg.call(zoom);

  }

  update(){


   

    console.log("Update scatter movies")


    
    y_movies.domain(votes_domain)

    this.yAxis.call(d3.axisLeft(y_movies).tickFormat(function (d) { if ((d / 1000) >= 1) {  d = d / 1000 + "K";} return d;}));

    this.ucircles = this.circles.data(ndx.allFiltered(), d => d.title+d.writer1)
    //this.svg.selectAll(".line")


    this.ucircles
      //.transition()
      .style("opacity", d => { if (!tooltip_active || d[tooltip_active]==tooltip_value){ return 0.7} else { 
        if(scatterplot_reduceviz){return 0.01}else{return 0.1}}})
      .attr("cx", function (d) { return x_movies(+d.avg_vote); } )
      .attr("cy", function (d) { return y_movies(+d.votes); } )
      .style("stroke", d => { if ( d[tooltip_active]==tooltip_value){ return "black"}})
      .style("stroke-width", 2)
      
    this.ucircles
        .exit()
        //.transition()
        .attr("cx", function (d) { return x_movies(+d.avg_vote); } )
        .attr("cy", function (d) { return y_movies(+d.votes); } )
        .style("opacity",d=>{if(scatterplot_reduceviz){return 0.01}else{return 0.1}})
        .style("stroke", d => { if (tooltip_active & d.tooltip_active==tooltip_value)  return "black" })


   }
 
    brushCallBackUpdateData(source) {

        var extent = d3.event.selection
          if(extent){
            votesDimension.filterRange([y_movies.invert(extent[1][1]), y_movies.invert(extent[0][1]) ])
            ratingDimension.filterRange([x_movies.invert(extent[0][0]), x_movies.invert(extent[1][0] ) ])

             d3.event = false
          }

        
        //displayTable(d3.event.selection)
          //myCircle.classed("selected", function(d){ return isBrushed(extent, x(d.avg_vote), y(d.votes) )} )
    

    }



  mouseover (d) {
      
      prods.new_tooltip()
      prods.show_tooltip(d.title)
          
        d3.select(this)
          .style("stroke", "black")

        this.parentNode.appendChild(this);
      }
      
    mouseleave (d) {
        prods.remove_tooltip()
        
          d3.select(this)
         .style("stroke", "none")


        
    }


  zoomed(transform) {
      console.log("ddece", transform)
    
  }


}