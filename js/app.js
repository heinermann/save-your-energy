
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
  
});
