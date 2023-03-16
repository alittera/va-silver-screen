    const dateFormatSpecifier = '%d/%m/%Y';
    const dateFormat = d3.timeFormat(dateFormatSpecifier);
    const dateFormatParser = d3.timeParse(dateFormatSpecifier);
    var colorpalette = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]

    let tooltip_active = false
    let tooltip_value = false

    let scrollstack_stop = false
    let scatterplot_reduceviz = false


    let all;
    let ndx;
    let votesDimension;
   
    
    let x_genre,y_genre;
    let x_boxplot,y_boxplot;

    let x_bargroup,y_bargroup;

    let prodGroup, genreGroup;
    let brushCallBackUpdateData;

    function prod_reduceAdd(p, v, nf) {
      ++p.count;
      p.total += +v.votes;
      return p;
    }

    function prod_reduceRemove(p, v, nf) {
      --p.count;
      p.total -= +v.votes;
      return p;
    }


    function prod_reduceInitial() {
      return {count: 0, total: 0};
    }

    function prod_orderValue(p) {
      return p.total;
    }

    //###############//###############//###############//###############//###############

    function actor_reduceAdd(p, v, nf) {
      ++p.count; 
      
      if (p.total.hasOwnProperty(v.genre1)) {
          ++p.total[v.genre1];
      } else {
          p.total[v.genre1] = 1;
      }
      return p;
    }

    function actor_reduceRemove(p, v, nf) {
      --p.count;
      
      if (p.total.hasOwnProperty(v.genre1)) {
          --p.total[v.genre1];
      } else {
          p.total[v.genre1] = 0;
      }

      return p;
    }

    function actor_reduceInitial() {
      return {count: 0, total: {}};
    }

    function actor_orderValue(p) {
      return p.total;
    }


    //###############//###############//###############//###############//###############

    d3.csv("data/prod.csv", function(data) {
      ndx_prod = crossfilter(data);
      xDimension = ndx_prod.dimension(d => {return +d.x;});
      yDimension = ndx_prod.dimension(d => {return +d.y;});
      prodFilter2 = ndx_prod.dimension(function(d) { return d.production_company; })

      prod_map = {};
      data.forEach(e => {
        prod_map[e.prod] = {x:+e.x , y:+e.y};
      });


    });



  
  function reload(){
    initbound = $('#initbound').val()

    localStorage.setItem("initbound", parseInt(initbound));
    localStorage.setItem("colorblind",$("#colorblind").prop('checked'));
    localStorage.setItem("scrollstack",$("#scrollstack").prop('checked'));
    localStorage.setItem("opcitymovies",$("#opcitymovies").prop('checked'));
    
    location.reload();
  }

  function counter_update(){
    $('#modalbutton').html(all.value() + " of " + ndx.size() + ' Film <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/></svg>')
  }

  function initall(data) { 

    
    console.log("INIT")

    var initbound = parseInt(localStorage.getItem("initbound")); 
    
    if(initbound === null || initbound<200){
      initbound = 10000;
      localStorage.setItem("initbound", initbound);
    }

    if(localStorage.getItem("colorblind")==="true"){
      colorpalette = ["#CC6677","#332288","#DDCC77","#117733","#88CCEE","#882255","#44AA99","#999933","#AA4499"]
      $("#colorblind").prop( "checked", true )
    }

    
    if(localStorage.getItem("scrollstack")==="true"){
      scrollstack_stop = true
      $("#scrollstack").prop( "checked", true )
    }

    if(localStorage.getItem("opcitymovies")==="true"){
      scatterplot_reduceviz = true
      $("#opcitymovies").prop( "checked", true )
    }

    
    $('#initbound').val(initbound);


    $('#initboundval').html(initbound)
   

    var data = data.filter(function(d) { return d.votes > initbound })
    //data = data.filter(function(d) { return d.country != "India" })
    //data = data.filter(function(d) { return d.country != "USA" })


    ndx = crossfilter(data);
    all = ndx.groupAll();

    votesDimension = ndx.dimension(d => {return +d.votes;});
    ratingDimension = ndx.dimension(d => {return +d.avg_vote;});

    yearFilter = ndx.dimension(function(d) { return +d.year; })

    genreFilter = ndx.dimension(function(d) { return d.genre1; })
    genreGroup = genreFilter.group();
    genres = genreGroup.all().map(d => d.key)
    genres_selection = genres.slice(0);
    genres_sort = genres.slice(0);
    genres_initial = genres.slice(0);

    

    prodFilter = ndx.dimension(function(d) { return d.production_company; })
    prodGroup = prodFilter.group();
    prodred = prodGroup.reduce(prod_reduceAdd, prod_reduceRemove, prod_reduceInitial).order(prod_orderValue);

    prodFilter2 = ndx.dimension(function(d) { return d.production_company; })
    prodGroup2 = prodFilter2.group();
    prodred2 = prodGroup2.reduce(prod_reduceAdd, prod_reduceRemove, prod_reduceInitial).order(prod_orderValue);


    if(false){
      stack = d3.stack().keys(genres)
      actorDimension =  ndx.dimension(function(d) { return d.actors.split("-").map(x =>  x.trim().replace("'","")); }, true);
      actorGroup = actorDimension.group();




      barplot_max_all = 100;
      actorred = actorGroup.reduce(actor_reduceAdd, actor_reduceRemove, actor_reduceInitial).order(actor_orderValue);
      
      /*actorred_sort = actorred.all().sort(function(a,b) {
       return true ? d3.ascending(a.value.count,b.value.count) : d3.ascending(b.value.count,a.value.count);
      })*/

      actorred_sort = actorred.order(actor_orderValue).all()

      name_keys_all = actorred_sort.map(function (d){
        return [d.key]
        barplot_max = ((barplot_max_all < d.value.count) ? d.value.count : barplot_max_all); 
      })
      stacked_data_all = actorred_sort.map(function (d){
        return [d.key, stack([d.value.total])]
      })



    }


    
    // Color scale genre
    genre_color = d3.scaleOrdinal()
    .domain(genres)
    .range(colorpalette)


    const disposeHandler =  ndx.onChange(event  => updateChartFilter());
    // ... then when done with the listener
    //disposeHandler();


    function updateChartFilter() {
        
        
        movies.update()
        prods.update()

        updateBarChart(genreGroup.all()) 
        timeline.update()
        horizontalbar.update()
        boxplot_update()
        counter_update()
        

    }

        
    BarChart()
    counter_update()
    movies = new scatterMoviePlot()
    prods = new scatterProdPlot()
    timeline = new timelinePlot()
    timeline.update()
    horizontalbar = new horizontalBarPlot()
    horizontalbar.update()
    
    boxplot()
    


    $.each(genres_selection, function (index, value) {
      $('#horizontal_sort_genre').append($('<option/>', { 
          text : value 
      }));
    });  


    //$('.selectpicker').selectpicker('val', ['Mustard','Relish']);
    
    //$('#horizontal_sort_genre').selectpicker('render');
    $('#horizontal_sort_genre').selectpicker('refresh');
    $('#horizontal_sort_genre').selectpicker('selectAll')

    $('#horizontal_sort_genre').on('hide.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        //console.log( $('#horizontal_sort_genre').selectpicker().val().slice())
        genres_sort =  $('#horizontal_sort_genre').selectpicker().val().slice(0)
        horizontalbar.update()
      });

    }


  //first load
  d3.csv("data/movies_genre12.csv", function (data) {
    initall(data);
  });
  