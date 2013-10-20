
//var vmousedown = false;

$(function(){
  // to be used for dragging stuff during a swipe
  //$(document).on("vmousedown", function(){ if ( !vmousedown ) vmousedown = true; });
  //$(document).on("vmouseup", function(){ if ( vmousedown ) vmousedown = false; });

  function swipe(target, direction) {
    return target.animate({ left: target.outerWidth()*direction, opacity: 0});
  }
  function swipeRemove(target, direction) {
    return swipe(target, direction).animate({ height: "0", margin: "0", padding: "0"},
      complete = function() { $(this).remove() } );
  }

  // Swipe handlers to remove entries
  $(".swipekill").on("swiperight", function(evt){
    swipeRemove($(evt.target), 1);
  });

  $(".swipekill").on("swipeleft", function(evt){
    swipeRemove($(evt.target), -1);
  });

  setInterval(function(){ 
    var tip = $(".tip");
    tip.animate({ left: -tip.outerWidth(), opacity: 0},complete=function(){ 
      $(this).css("left", $(this).outerWidth());
      tip.html( tipsarr[Math.floor((Math.random()*tipsarr.length))] );
    }).animate({ left: 0, opacity: 1.0});
  }, 10*1000);
  
  // update usage metrics on home screen
  {
    // accumulate costs
    var totalToday = 0;
  
    var current15 = $("#current15");
    current15.text("awaiting data...");
    
    var past15 = $("#past15");
    past15.text("awaiting data...");
    
    var currentTotal = $("#currentTotal");
    currentTotal.text("awaiting data...");
    
    var pastTotal = $("#pastTotal");
    // spoofed. todo: might want to base on Electric usage config.
    pastTotal.text("$" + randomInRange(5, 15).toFixed(2));
    
    Electric.observe(function (u) {
    
      var currentCost = Electric.costToDollars(u.cost);
      var pastCost = currentCost + randomInRange(-0.5, 0.5); // spoofed
      var delta = currentCost - pastCost;
      totalToday += currentCost;
      
      currentTotal.text("$" + totalToday.toFixed(2));
      current15.text("$" + currentCost.toFixed(2));
      past15.text("$" + pastCost.toFixed(2) + ", $" + delta.toFixed(2));
      
    });
  }
  
  // begin realtime electric usage receiving
  Electric.start(5000);
  
  
  // fake push notifications
  $(document).keypress(function (e) {
     
     var hKey = 104;
     var jKey = 106;
     var kKey = 107;
     var lKey = 108;
     
     var leavingHome = $("#leaving-home-dialog");
     leavingHome.popup();
     
     var peakHours = $("#peak-hours-dialog");
     peakHours.popup();
     
     var offHours = $("#off-hours-dialog");
     offHours.popup();
     
     if (e.keyCode == hKey) {
       leavingHome.popup("open");
     }
     else if (e.keyCode == jKey) {
      peakHours.popup("open");
     }
     else if (e.keyCode == kKey) {
      offHours.popup("open");
     }
     
  });
  
  
  // testing for temperature spoofing
  // TODO: remove
  /*{
    console.log(Temp.createDataset({ minTemp: -100, maxTemp: 100, maxVariance: 10 }, 10, 15));
    var cb = function (t) {
      console.log("the temp is " + t + " deg C");
    }
    Temp.observe(cb);
    setTimeout(function () { Temp.unobserve(cb); }, 3*1000);
    Temp.start(1000);
  }
  */
  
  // testing for usage spoofing
  // TODO: remove
  /*
  {
    console.log(Electric.createDataset(Electric.getConf(), 10));
    var cb = function (u) {
      console.log("the usage is $" + u.cost/100000.0);
    }
    Electric.observe(cb);
    setTimeout(function () { Electric.unobserve(cb); }, 3*1000);
    Electric.start(1000);
  }
  */
  
});
