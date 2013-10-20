function get_random_color() {
    return "#" + (Math.round(Math.random() * 0XFFFFFF)&0x7F7F7F).toString(16);
}

function get_random_number(b, t) {
  return Math.floor(Math.random() * (1 + t - b)) + b;
}

var displayValue = true;
function get_y_value (obj) {
  if (displayValue == true) {
    return obj.value;
  }
  else {
    return obj.cost;
  }
}

function addPath (data, line, color) {
  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke", color);
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
    .y(function(d) { return y(get_y_value(d)); });

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

  // find the colour legend element
  var colourLegend = $("#graph-legend");

  var block = data.feed.entry[2].content.IntervalBlock;
  // Block is the list of 14 days with 96 points each
  // data <- block[k].IntervalReading;

  // A 'day' block contains 96 points
  // A 'week' block should have 7 points
  // A 'month' block should have 28/29/30/31 points
  // A 'year' block should have 12 points

  // Colors 
  var timeInterval = 0;

  function updateGraph() {
    var blockTemp = [];
    var randBlockData = [];
    var n = get_random_number(timeInterval, 414-timeInterval-1);
    for(var k = 0; k < timeInterval ; k++) {
      var summObj = { "cost":0, "value":0, 
        "timePeriod":{"start": block[k].interval.start, "duration": block[k].interval.duration } };
      var randObj = { "cost":0, "value":0, 
        "timePeriod":{"start": block[n+k].interval.start, "duration": block[n+k].interval.duration } };

      for ( var j = 0; j < block[k].IntervalReading.length; ++j ){
        if ( timeInterval == 1 ) {
          blockTemp.push(block[k].IntervalReading[j]);
          randBlockData.push(block[n+k].IntervalReading[j]);
        }
        else {
          summObj.cost += parseInt(block[k].IntervalReading[j].cost);
          summObj.value += parseInt(block[k].IntervalReading[j].value);
          randObj.cost += parseInt(block[n+k].IntervalReading[j].cost);
          randObj.value += parseInt(block[n+k].IntervalReading[j].value);
        }

      }
      if ( timeInterval > 1 ) {
        blockTemp.push(summObj);
        randBlockData.push(block[n+k].IntervalReading[0]);
      }
    }

    x.domain(d3.extent(blockTemp, function(d) { return new Date(d.timePeriod.start * 1000); }));
    y.domain(d3.extent(blockTemp, function(d) { return parseInt(get_y_value(d)); }));
    refresh();

    var line = d3.svg.line()
        .x(function(d) { return x(new Date(d.timePeriod.start * 1000)); })
        .y(function(d) { return y(get_y_value(d)); });

    addPath(blockTemp, line, 'black');

    x.domain(d3.extent(randBlockData, function(d) { return new Date(d.timePeriod.start * 1000); }));
    y.domain(d3.extent(randBlockData, function(d) { return parseInt(get_y_value(d));}));

    // Pick 7 days
    var color2 = get_random_color();
    addPath(randBlockData, line, color2);
    // update legend
    colourLegend.find(".secondary .colour").css("background", color2);
  }

  $('#value-radio').change('change', function(){
    if ($(this).is(':checked')) {
      displayValue = true;
      updateGraph();
    }
  });

  $('#cost-radio').change('change', function(){
    if ($(this).is(':checked')) {
      displayValue = false;
      updateGraph();
    }
  });

  $('.time-interval-radio').change('change', function(){
    if ( $(this).is(':checked') ) {
      timeInterval = parseInt($(this).data("interval"));
      updateGraph();
    }
  });

  // trigger day graph
  $('#day-radio').trigger('change');
});

