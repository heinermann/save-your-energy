function get_random_color() {
    return "#" + (Math.round(Math.random() * 0XFFFFFF)).toString(16);
}

function refresh () {
  d3.selectAll("g.xaxis").data([]).exit().remove();
  d3.selectAll("g.yaxis").data([]).exit().remove();
  d3.selectAll("path").data([]).exit().remove();
  // Displays x axis
  svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .attr("font-size", "9px")
      .call(xAxis);

  // Displays y axis
  svg.append("g")
      .attr("class", "yaxis")
      .attr("font-size", "10px")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Watt-hour(Wh)");


}

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

// Scaling and axis stuff
var x = d3.time.scale()
    .range([0, width-150]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(new Date(d.timePeriod.start * 1000)); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("#graph-placeholder").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legend = svg.append("g")
  .attr("x", width-65)
  .attr("y", 25)
  .attr("height", 100)
  .attr("width", 100);

// Reading the json stuff
d3.json("HackWE-Data.json", function(error, data) {
  var block = data.feed.entry[2].content.IntervalBlock;
  // Block is the list of 14 days with 96 points each
  // data <- block[k].IntervalReading;

  // A 'day' block contains 96 points
  // A 'week' block should have 7 points
  // A 'month' block should have 28/30/31 points
  // A 'year' block should have 12 points

  $('#day-radio').change('change', function(){
    if ($(this).is(':checked')){
      x.domain(d3.extent(block[0].IntervalReading, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(block[0].IntervalReading, function(d) { return parseInt(d.value); }));
      //d3.selectAll("g.xaxis").data([]).exit().remove();
      //d3.selectAll("g.yaxis").data([]).exit().remove();
      //d3.selectAll("path").data([]).exit().remove();
      refresh();

      // Assume today is the first block
      var todays_data = block[0].IntervalReading;
      var color = get_random_color();
      svg.append("path")
          .datum(todays_data)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", color);
    }
  });

  $('#week-radio').change('change', function(){
    if ($(this).is(':checked')){
      x.domain(d3.extent(block[0].IntervalReading, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(block[0].IntervalReading, function(d) { return parseInt(d.value); }));
      refresh();
      // Pick 7 days
    }
  });

  for (var k = 0; k < block.length-11; k++) {
    var this_data = block[k].IntervalReading;
    console.log(this_data);
  }
       /*
    var todaysDate = new Date(this_data[0].timePeriod.start * 1000);
    var color = get_random_color();
    svg.append("path")
        .datum(this_data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", color);
    // Add to legend
    legend.append("rect")
      .attr("x", width/2 - 65)
      .attr("y", height - (k * 25) -10 )
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color);

    legend.append("text")
      .attr("x", width/2 - 50)
      .attr("y", height - (k * 25) + 2)
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", color)
      .text(months[todaysDate.getMonth()] + " " + todaysDate.getDate() + ", " + todaysDate.getFullYear());
  */
  //}
});

