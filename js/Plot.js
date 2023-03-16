class Plot {

  constructor(id, margin, ws=5,hs=5) {
  var rect = d3.select(id).node().getBoundingClientRect();
  this.histoWidth = rect.width-ws;
  this.histoHeight = rect.height-hs;
  this.id = id
  this.margin = margin
  this.width = this.histoWidth - this.margin.left - this.margin.right;
  this.height = this.histoHeight - this.margin.top - this.margin.bottom;    
    
  this.svg = d3.select(this.id)
      .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .attr("id",id.substring(1)+"svg")
      .append("g")
        .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")")
  this.brush = null

  }
  
  getBrush() {
    return this.brush;
  }

  new_tooltip(){
      this.tooltip = d3.select(this.id)
      .append("div")
      .style("position", "absolute")
      .style("opacity", 0)
      .attr("class", "tooltip_lines")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-this.width", "1px")
      .style("border-radius", "5px")
      .style("padding", "3px")
      return this.tooltip 
    }

  show_tooltip(text){
    this.tooltip
    .style("opacity", 0.9)
    .html(text)
    .style("left", (d3.event.pageX+5) + "px")
    .style("top", (d3.event.pageY) + "px")
  }
  get_tooltip(){
    return this.tooltip
  }
  remove_tooltip(){
    this.tooltip.remove()
  }


}