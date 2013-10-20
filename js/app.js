
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

  function registerSwipeKill(element) {
    element.on("swiperight", function(evt){
      swipeRemove($(evt.target), 1);
    });

    element.on("swipeleft", function(evt){
      swipeRemove($(evt.target), -1);
    });

  }
  registerSwipeKill($(".swipekillctrl > li"));

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
      var pastCost = currentCost*randomInRange(0.8, 1.2); // spoofed
      var delta = pastCost - currentCost;
      totalToday += currentCost;
      
      currentTotal.text(formatDollars(totalToday));
      current15.text(formatDollars(currentCost));
      past15.text(formatDollars(pastCost) + ", " + formatDollars(delta, true));
      
    });
  }
  
  // begin realtime electric usage receiving
  Electric.start(5000);
  
  
  function addNotification(icon,str,hasPopup) {
    if ( typeof hasPopup == 'undefined' )
      hasPopup = false;

    var notificationList = $("#notification-list");
    var elem = $("<li class='ui-li-has-icon'><img src='"
      +icon+"' width='32' height='32' class='ui-li-icon'>"+str+"</li>")
      .prependTo(notificationList).hide();
    if ( hasPopup ) {
      $(".popupstr").html(str);
      $("#general-dialog").popup("open");
    }

    registerSwipeKill(elem);
    notificationList.listview("refresh");
    elem.slideDown();
  }
  
  // fake push notifications
  $(document).keypress(function (e) {
  
     var hKey = 104;
     var jKey = 106;
     var kKey = 107;
     var lKey = 108;
    /* 
     var leavingHome = $("#leaving-home-dialog");
     leavingHome.popup();
     
     var peakHours = $("#peak-hours-dialog");
     peakHours.popup();
     
     var offHours = $("#off-hours-dialog");
     offHours.popup();
    */ 
     if (e.keyCode == hKey) {
       addNotification("image/home-icon.png", "Turn off unnecessary devices if you will be away from home.", true);
     }
     else if (e.keyCode == jKey) {
       addNotification("image/peak-icon.png", "Peak hours begin soon at the rate of <span style=\"font-family:monospace\">$0.12/kWh</span>. Turning off unnecessary devices is advised.", true);
     }
     else if (e.keyCode == kKey) {
       addNotification("image/off-icon.png", "Off hours begin soon at the rate of <span style=\"font-family:monospace\">$0.02/kWh</span>. Using necessary high power devices at this time is advised.", true);
     }
     else if (e.keyCode == lKey) {
       var r = Math.round(randomInRange(0,3));
       if (r == 0) addNotification("image/therm-icon.png", "Temperature today is 4&deg;C. Heating recommended."); 
       else if (r == 1) addNotification("image/therm-icon.png", "Temperature today is 34&deg;C. Air conditioning recommended.");
       else if (r == 2) addNotification("image/therm-icon.png", "Temperature today is 22&deg;C. No air conditioning and open windows recommended.");
       else if (r == 3) addNotification("image/therm-icon.png", "Temperature today is 12&deg;C. No heating and extra clothing is recommended.");
     }
     
  });
  
  
  // animate intro
  
  // dev setting:
  $("#intro").css('display', 'none');
  
  // todo: re-enable this for presentation.
  /*
  setTimeout(function () {
    $("#intro .logo-wrap").fadeIn();
  }, 750);
  setTimeout(function () {
    $("#intro").fadeOut(1000);
  }, 3000);
  */
  
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


function formatDollars(dollars, includePlus) {
  var abs = Math.abs(dollars);
  if (dollars < 0) {
    return "-$" + abs.toFixed(2);
  }
  else if (includePlus) {
    return "+$" + abs.toFixed(2);
  }
  else {
    return "$" + abs.toFixed(2);
  }
}

