function get_random_color() {
    return "#" + (Math.round(Math.random() * 0XFFFFFF)).toString(16);
}

function get_random_number(b, t) {
  return Math.floor(Math.random() * (1 + t - b)) + b;
}

function get_y_value (obj, displayValue) {
  if (displayValue == true) {
    return obj.value;
  }
  else {
    return obj.cost;
  }
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

var displayValue = true;

var line = d3.svg.line()
    .x(function(d) { return x(new Date(d.timePeriod.start * 1000)); })
    .y(function(d) { return y(get_y_value(d, displayValue)); });

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
d3.json("HackWE-BigData.json", function(error, data) {
  var block = data.feed.entry[2].content.IntervalBlock;
  // Block is the list of 14 days with 96 points each
  // data <- block[k].IntervalReading;

  // A 'day' block contains 96 points
  // A 'week' block should have 7 points
  // A 'month' block should have 28/30/31 points
  // A 'year' block should have 12 points

  // Colors 
  var daycolor = "black";
  var weekcolor = "black";
  var monthcolor = "black";
  var yearcolor = "black";


  $('#value-radio').change('change', function(){
    if ($(this).is(':checked')) {
      displayValue = true;
    }
  });

  $('#cost-radio').change('change', function(){
    if ($(this).is(':checked')) {
      displayValue = false;
    }
  });

  $('#day-radio').change('change', function(){
    if ($(this).is(':checked')){
      x.domain(d3.extent(block[0].IntervalReading, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(block[0].IntervalReading, function(d) { return parseInt(get_y_value(d, displayValue)); }));
      refresh();

      // Assume today is the first block
      var todays_data = block[0].IntervalReading;
      svg.append("path")
          .datum(todays_data)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", daycolor);

      // Add random data
      var color2 = get_random_color();
      var random_data = block[get_random_number(0, 413)].IntervalReading;
      x.domain(d3.extent(random_data, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(random_data, function(d) { return parseInt(get_y_value(d, displayValue)); }));
      svg.append("path")
        .datum(random_data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", color2);
    }
  });

  $('#week-radio').change('change', function(){
    if ($(this).is(':checked')){
      var blockWeek = [];
      var randBlockWeek = [];
      var n = get_random_number(8, 414-8);
      for(var k = 0; k < 7 ; k++) {
        blockWeek.push(block[k].IntervalReading[0]);
        randBlockWeek.push(block[n+k].IntervalReading[0]);
      }
      x.domain(d3.extent(blockWeek, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(blockWeek, function(d) { return parseInt(get_y_value(d, displayValue)); }));
      refresh();
      var lineWeek = d3.svg.line()
        .x(function(d) { return x(new Date(d.timePeriod.start * 1000)); })
        .y(function(d) { return y(get_y_value(d, displayValue)); });

      // Pick 7 days
      svg.append("path")
        .datum(blockWeek)
        .attr("class", "line")
        .attr("d", lineWeek)
        .attr("stroke", weekcolor);

      x.domain(d3.extent(randBlockWeek, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(randBlockWeek, function(d) { return parseInt(get_y_value(d, displayValue));}));

      // Pick 7 days
      var color2 = get_random_color();
      svg.append("path")
        .datum(randBlockWeek)
        .attr("class", "line")
        .attr("d", lineWeek)
        .attr("stroke", color2);
    }
  });

  $('#month-radio').change('change', function(){
    if ($(this).is(':checked')){
      var blockMonth = [];
      var randBlockMonth = [];
      var n = get_random_number(31, 414-31);
      for(var k = 0; k < 31 ; k++) {
        blockMonth.push(block[k].IntervalReading[0]);
        randBlockMonth.push(block[n+k].IntervalReading[0]);
      }
      x.domain(d3.extent(blockMonth, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(blockMonth, function(d) { return parseInt(get_y_value(d, displayValue)); }));
      refresh();

      var lineWeek = d3.svg.line()
        .x(function(d) { return x(new Date(d.timePeriod.start * 1000)); })
        .y(function(d) { return y(get_y_value(d, displayValue)); });

      // Pick 7 days
      svg.append("path")
        .datum(blockMonth)
        .attr("class", "line")
        .attr("d", lineWeek)
        .attr("stroke", monthcolor);

      x.domain(d3.extent(randBlockMonth, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(randBlockMonth, function(d) { return parseInt(get_y_value(d, displayValue)); }));

      // Pick 7 days
      var color2 = get_random_color();
      svg.append("path")
        .datum(randBlockMonth)
        .attr("class", "line")
        .attr("d", lineWeek)
        .attr("stroke", color2);
    }
  });

  $('#year-radio').change('change', function(){
    if ($(this).is(':checked')){
      var blockYear = [];
      var randBlockYear = [];
      var n = get_random_number(12, 414-12);
      for(var k = 0; k < 12; k++) {
        blockYear.push(block[k].IntervalReading[0]);
        randBlockYear.push(block[n+k].IntervalReading[0]);
      }
      x.domain(d3.extent(blockYear, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(blockYear, function(d) { return parseInt(get_y_value(d, displayValue)); }));
      refresh();

      var lineWeek = d3.svg.line()
        .x(function(d) { return x(new Date(d.timePeriod.start * 1000)); })
        .y(function(d) { return y(get_y_value(d, displayValue)); });

      // Pick 7 days
      svg.append("path")
        .datum(blockYear)
        .attr("class", "line")
        .attr("d", lineWeek)
        .attr("stroke", yearcolor);

      x.domain(d3.extent(randBlockYear, function(d) { return new Date(d.timePeriod.start * 1000); }));
      y.domain(d3.extent(randBlockYear, function(d) { return parseInt(get_y_value(d, displayValue)); }));

      // Pick 7 days
      var color2 = get_random_color();
      svg.append("path")
        .datum(randBlockYear)
        .attr("class", "line")
        .attr("d", lineWeek)
        .attr("stroke", color2);
    }
  });

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

