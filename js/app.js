var vmousedown = false;

$(function(){
  // to be used for dragging stuff during a swipe
  $(document).on("vmousedown", function(){ if ( !vmousedown ) vmousedown = true; });
  $(document).on("vmouseup", function(){ if ( vmousedown ) vmousedown = false; });

  // Swipe handlers to remove entries
  $(".swipekill").on("swiperight", function(evt){
    var targ = $(evt.target);
    console.log("right");
    targ.animate({ left: targ.outerWidth(), opacity: 0 })
      .animate({ height: "0", margin: "0", padding: "0"}, complete=function(){ $(this).remove() });
  });

  $(".swipekill").on("swipeleft", function(evt){
    var targ = $(evt.target);
    console.log("left");
    targ.animate({ left: -targ.outerWidth(), opacity: 0 })
      .animate({ height: "0", margin: "0", padding: "0"}, complete=function(){ $(this).remove() });
  });
  
  // testing for temperature spoofing
  // TODO: remove
  {
    console.log(Temp.createDataset({ minTemp: -100, maxTemp: 100, maxVariance: 10 }, 10, 15));
    var cb = function (t) {
      console.log("the temp is " + t + " deg C");
    }
    Temp.observe(cb);
    setTimeout(function () { Temp.unobserve(cb); }, 3*1000);
    Temp.start(1000);
  }
  
  // testing for usage spoofing
  // TODO: remove
  {
    console.log(Electric.createDataset(Electric.getConf(), 10));
    var cb = function (u) {
      console.log("the usage is $" + u.cost/100000.0);
    }
    Electric.observe(cb);
    setTimeout(function () { Electric.unobserve(cb); }, 3*1000);
    Electric.start(1000);
  }
  
});
