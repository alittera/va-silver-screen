/* Global variable/functions to pass inside d3js function cycle */
//let color_prod;
let x_prod,y_prod, x_prod_scale,y_prod_scale;

class scatterProdPlot extends Plot {
  constructor() {
    
    super("#brushScatter_prod", {top: 10, right: 30, bottom: 40, left: 40});

    x_prod = d3.scaleLinear()
      .domain([-200, 200])
      .range([ 0, this.width ]);

    x_prod_scale = x_prod

    this.prod_x_axis = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x_prod))
      .attr("class", "prod_x_axis");

    // Add Y axis
    y_prod = d3.scaleLinear()
      .domain([-200, 200])
      .range([ this.height, 0]);

    y_prod_scale = y_prod
      
    this.prod_y_axis = this.svg.append("g")
        .call(d3.axisLeft(y_prod))
        .attr("class", "prod_y_axis");

    this.brush = d3.brush()                 // Add the brush feature using the d3.brush function
	    .extent( [ [0,0], [this.width,this.height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
	    //.on("brush", brushCallBackUpdateData_prod)
	    .on("end", this.brushCallBackUpdateData_prod.bind(this)) 
    this.brush_prod_do = false

    this.zoom = d3.zoom()
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([1,3])
      .on("zoom", this.zoomed_prod.bind(this))
      

    this.color_prod = d3.scalePow().exponent(0.9).range(["yellow", "red"])

    this.svg.append('g')
      .attr("class", "brush")
      .call( this.brush)

    var clip = this.svg.append("defs").append("svg:clipPath")
          .attr("id", "clip")
          .append("svg:rect")
          .attr("width", this.width-this.margin.right-this.margin.left )
          .attr("height", this.height )
          .attr("x", 0)
          .attr("y", 0);

      // Create the scatter variable: where both the circles and the brush take place
    var scatter = this.svg.append('g')
        .attr("clip-path", "url(#clip)")
      

    this.circles = scatter.append('g')
        .attr("class","scattgroup_prod")
        .selectAll("circle")
        .data(prodGroup.all(), d => d.key+d.value.total.toString()+d.value.count.toString())
        .enter()
        .append("circle")
          .attr("cx", d => (d.key in prod_map ? x_prod_scale(prod_map[d.key].x) : x_prod_scale(-200)) )    
          .attr("cy", d => (d.key in prod_map ? y_prod_scale(prod_map[d.key].y) : y_prod_scale(-200)) )
          .attr("r", 3)
          .style("fill", d => this.color_prod(d.value.count/9) )
          .style("opacity", 0.5)



 		this.circles
			.on("mouseover", this.mouseover )
			//.on("mousemove", this.mousemove)
			.on("mouseleave", this.mouseleave)


		 // this.tooltip_scatter_prod = d3.select(this.id)
		 //    .append("div")
		 //    .style("opacity", 0)
		 //    .style("position", "absolute")
		 //    .attr("class", "tooltip_scatter_prod")
		 //    .style("background-color", "blue")
		 //    .style("border", "solid")
		 //    .style("border-width", "1px")
		 //    .style("border-radius", "5px")
		 //    .style("padding", "3px")



    this.svg.append("text")
      //.attr("class", "lines_y_label")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", - this.margin.left)
      .attr("x", -150)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Component 2"); 

      // text label for the x axis
      this.svg.append("text")
      .attr("fill", "black")   
      //.attr("class", "lines_x_label")          
      .attr("transform",
            "translate(" + this.width/2 + " ," + (this.height+ this.margin.top + this.margin.bottom-20)+ ")")
      .style("text-anchor", "middle")
      .text("Component 1 (Production companies)");

      this.svg.on("dblclick", d => {
              
              d3.event.preventDefault();
              x_prod.domain([-200, 200]);
              x_prod_scale = x_prod
              y_prod.domain([-200, 200]);
              y_prod_scale = y_prod
              d3.select(".scattgroup_prod").attr("transform", null);
              prodFilter2.filterAll();
              d3.select(".scattgroup_prod").attr("transform", [0,0,0]);
            });

    this.svg.call(this.zoom);

    this.legend = Array.from({length: 10}, (x, i) => [i*5,this.color_prod(i/9),i*5]);

    this.svg
    .append("rect")
    .attr("y", d => 190)
    .attr("x", d => this.width-this.margin.left)
    .attr("width", 30)
    .attr("height",115)
    .attr("fill","white")

    this.svg
    .selectAll(".rects")
    .data(this.legend, d => d[0])
    .enter()
    .append("rect")
    .attr("y", d => 200+d[0]*2)
    .attr("x", d => this.width-this.margin.left)
    .attr("width", 5)
    .attr("height",5)
    .attr("fill", d => d[1])

    this.svg
    .append("rect")
    .attr("y",  200+5*this.legend.length*2)
    .attr("x", this.width-this.margin.left)
    .attr("width", 5)
    .attr("height",5)
    .attr("fill", "red")

    this.svg
    .selectAll(".stext")
    .data(this.legend, d => d[1])
    .enter()
    .append("text")
    //.style("text-anchor", "middle")
    .text(function(d) {  return ""+d[0]; })
    .attr("y", d => 207+d[0]*2)
    .attr("x", d => this.width-this.margin.left+10)
    //.attr("dy", "1em")
    .style("font-size", '0.7em')


    this.svg
    .append("text")
    //.style("text-anchor", "middle")
    .text(">50")
    .attr("y", d =>  207+5*this.legend.length*2)
    .attr("x", d => this.width-this.margin.left+10)
    //.attr("dy", "1em")
    .style("font-size", '0.7em')

    this.svg
    .append("text")
    //.style("text-anchor", "middle")
    .text("№Film")
    .attr("y", d =>  197)
    .attr("x", d => this.width-this.margin.left+2)
    //.attr("dy", "1em")
    .style("font-size", '0.7em')



  }


  zoomed_prod() {
      d3.select(".scattgroup_prod").attr("transform", d3.event.transform);
      x_prod_scale = d3.event.transform.rescaleX(x_prod);
      y_prod_scale = d3.event.transform.rescaleY(y_prod);
      //d3.select(".overlay").attr("transform", d3.event.transform);
      this.prod_x_axis.call(d3.axisBottom(x_prod_scale))
      this.prod_y_axis.call(d3.axisLeft(y_prod_scale))
  }



    mouseover (d) {

      if(d3.select(this).style("opacity")>0){
        prods.new_tooltip()
        prods.show_tooltip(d.key)
        
            
        d3.select(this)
            .style("stroke", "black")
        this.parentNode.appendChild(this);
        tooltip_active="production_company"
        tooltip_value=d.key
        movies.update()

        boxplot_update()
        if(tooltip_active==d3.select("#linesdropdown").property("value")){
           timeline.update_over()
        }
      }

     
    }
      
    mouseleave (d) {
      if(d3.select(this).style("opacity")>0){
      prods.remove_tooltip() 
      d3.select(this).style("stroke", "none")
      tooltip_active=false
      tooltip_value=false
      movies.update()
      }
      prods.remove_tooltip() 
      d3.select(this).style("stroke", "none")
    }

    
      
    

  update(){
   
   
    function idled() { idleTimeout = null; }
      
    console.log("updateScatterPlot_prod")

    if(this.brush_prod_do){

      if(!this.extent_p){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit

        x_prod = d3.scaleLinear().domain([-200, 200]);
        y_prod = d3.scaleLinear().domain([-200, 200]);
        d3.select(".scattgroup_prod").attr("transform", null);
      }else{        
        x_prod.domain([ x_prod_scale.invert(this.extent_p[0][0]), x_prod_scale.invert(this.extent_p[1][0]) ])
        y_prod.domain([ y_prod_scale.invert(this.extent_p[1][1]), y_prod_scale.invert(this.extent_p[0][1]) ])

        this.svg.select(".brush").call(this.brush.move, null)
        d3.select(".scattgroup_prod").attr("transform", null);
      
      }
      this.brush_prod_do = false

    }
      this.prod_x_axis
        .call(d3.axisBottom(x_prod));

      this.prod_y_axis
        .call(d3.axisLeft(y_prod));

    //var myColor = d3.scaleSequential().domain([1,20]).interpolator(d3.interpolateViridis);

    var expScale = d3.scalePow()
      .exponent(Math.E)
      .domain([0, 20])
    //var myColor = d3.scaleSequential((d) => d3.interpolateReds(expScale(d)))


    this.circles = this.svg
    .selectAll("circle")
    .data(prodGroup.all(), d => d.key+d.value.total.toString()+d.value.count.toString())

     this.circles
     //.transition()
      .style("opacity", d => 1*d.value.count)
      .style("fill", d => this.color_prod(d.value.count/9) )
      .attr("cx", function (d) { return d.key in prod_map ?  x_prod(prod_map[d.key].x) : x_prod(-200); } )
      .attr("cy", function (d) { return d.key in prod_map ?  y_prod(prod_map[d.key].y) : y_prod(-200); } )

     this.circles
        .exit()
        .style("opacity", function(d){ return 0.1})


  }

  filterProds(d){

      if (d in prod_map){
        var prod = prod_map[d]
             return (
              x_prod_scale(prod.x) > this.extent_p[0][0] &&
              x_prod_scale(prod.x) < this.extent_p[1][0] &&
              y_prod_scale(prod.y) > this.extent_p[0][1] &&
              y_prod_scale(prod.y) < this.extent_p[1][1])
      }
      else{
        return false
      }
  }
 
  brushCallBackUpdateData_prod() {


      this.extent_p = d3.event.selection

      this.brush_prod_do = true

      if(this.extent_p){

        prodFilter2.filterFunction(this.filterProds.bind(this))

       
      }
      this.brush_prod_do = false
      d3.select(".scattgroup_prod").attr("transform", null);
      //   displayTable(d3.event.selection)
        //myCircle.classed("selected", function(d){ return isBrushed(extent, x(d.avg_vote), y(d.votes) )} )
  }





}