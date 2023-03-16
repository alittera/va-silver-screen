orderGenre = false
function filterGenres(d){
      return genres_selection.includes(d)
}

barchartHeightMargin=38
function BarChart() {

  var rect = d3.select("#genres").node().getBoundingClientRect(); //the node() function get the DOM element represented by the selection (d3.select)
        histoWidth = rect.width;
        histoHeight = rect.height-barchartHeightMargin;


    var data = genreGroup.all()
    //click e doubleckick
    var timeout = null;
    
    //data = data.sort((a,b) => b.value > a.value);

  /// set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 70, left: 55},
        width = histoWidth - margin.left - margin.right,
        height = histoHeight - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);
    var y = d3.scaleLinear()
              .range([height, 0]);
              
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#genres").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // get the data


      // Scale the range of the data in the domains
      x.domain(data.map(function(d) { return d.key; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      // append the rectangles for the bar chart
      svg.selectAll(".bar")
          .data(data,  d => d.key)
          .enter()
          .append("rect")
          .attr("fill", function(d) {return genre_color(d.key); })
          .style("opacity", function(d) {if(genres_selection.includes(d.key)){ return 1;}else{return 0.5 } })
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.key); })
          .attr("width", x.bandwidth())
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .on("mouseover", mouseover_barchart)
          .on("click", function(d){
            clearTimeout(timeout);
            timeout = setTimeout(function() {
              if(!genres_selection.includes(d.key)){          //checking weather array contain the id
                genres_selection.push(d.key);               //adding to array because value doesnt exists
              }else{
                genres_selection.splice(genres_selection.indexOf(d.key), 1);  //deleting
              }
              genreFilter.filterFunction(filterGenres)
            }, 150)    
          })
          .on("dblclick", function(d){
            clearTimeout(timeout);
            console.log("##",genres_selection,[d.key] )
            if(genres_selection.length == 1 && genres_selection[0] == d.key){
              genres_selection = genres_initial.slice(0)
              console.log("RES")
            }else{
              genres_selection = [d.key]
            }
            
            genreFilter.filterFunction(filterGenres)


            })

      svg.selectAll(".bartext")
          .data(data,  d => d.key)
          .enter()
          .append("text")
          .attr("class", "bartext")
            .attr("x", function(d) { return x(d.key); })
            .attr("y", function(d) { return y(d.value)-3; })
            .text(function(d) { return d.value; })
            .style("font-size", '0.7em')



     


      // add the x Axis
      svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
         .selectAll("text")  
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-90)");

      // add the y Axis
      svg.append("g")
          .attr("class", "yaxis")
          .call(d3.axisLeft(y));



      svg.append("text")
      //.attr("class", "lines_y_label")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", - margin.left)
      .attr("x", -150)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of films"); 

      // text label for the x axis
      // svg.append("text")
      // .attr("fill", "black")   
      // //.attr("class", "lines_x_label")          
      // .attr("transform",
      //       "translate(" + width/2 + " ," + (height+ margin.top + margin.bottom - 50)+ ")")
      // .style("text-anchor", "middle")
      // .text("Genre");





    var orderGenreButton = d3.select('#orderGenre')



    orderGenreButton.on("change", function(d) {
        orderGenre = d3.select(this).property("checked")
        updateBarChart()
      })


    var mouseover_barchart = function () {
      
    }

    }


function updateBarChart() {
  /// set the dimensions and margins of the graph
  var rect = d3.select("#genres").node().getBoundingClientRect(); //the node() function get the DOM element represented by the selection (d3.select)
        histoWidth = rect.width;
        histoHeight = rect.height-barchartHeightMargin;


  /// set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 70, left: 55},
        width = histoWidth - margin.left - margin.right,
        height = histoHeight - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
              .range([0, width])
              .padding(0.1);
    var y = d3.scaleLinear()
              .range([height, 0]);

    var data = genreGroup.all().slice()
   

    if(orderGenre){
      data.sort((a, b) => b.value-a.value);
    }
    
    //console.log("generi after ",data)


    x.domain(data.map(function(d) { return d.key; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);


    
    var svg = d3.select("#genres")
    svg
          .selectAll(".bar")
          .data(data, d => d.key)
          //.transition()
          //.duration(200)
          .attr("class", "bar")
          .attr("x", function(d) {return x(d.key); })
          .attr("width", x.bandwidth())
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); })
          .style("opacity", function(d) {if(genres_selection.includes(d.key)){ return 1;}else{return 0.5 } })
          

    svg.selectAll(".bartext")
          .data(genreGroup.all(),  d => d.key)
          //.transition()
          //.duration(200)
            .attr("x", function(d) { return x(d.key)+2; })
            .attr("y", function(d) { return y(d.value)-3; })
            .text(function(d) { return d.value; })

      // add the y Axis
      svg.selectAll(".yaxis")
      //.transition()
          //.duration(200)
          .call(d3.axisLeft(y));

      svg.selectAll(".xaxis")
      //.transition()
          //.duration(200)
          .call(d3.axisBottom(x));

    }