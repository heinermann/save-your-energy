/*
 * Module for realtime temperature data spoofing.
 */
var Temp = (function (m) {
  
  var observers = [];
  var timer;
  var currentTemp;
  var tempConf = {
    minTemp: -20.0,
    maxTemp: 35.0,
    maxVariance: 2.0
  };
  
  /*
   * Takes a temperature between a minTemp and maxTemp and return a varied
   * temperature (randomized) in the range of +/- maxVariance.
   */
  var varyTemp = function(conf, temp) {
  
    minTemp = conf.minTemp;
    maxTemp = conf.maxTemp;
    maxVariance = conf.maxVariance;
  
    // sanity check
    if (temp < minTemp) console.log("temp '" + temp + "' out of range '" + minTemp + "'.");
    if (temp > maxTemp) console.log("temp '" + temp + "' out of range '" + maxTemp + "'.");
    
    // calculate delta sign.
    // temp == minTemp => 100% for positive
    // temp == maxTemp => 100% for negative
    
    var deltaSign;
    {
      var r = Math.random();
      var t = (temp - minTemp) / (maxTemp - minTemp);
      deltaSign = r < t ? -1.0 : 1.0;
    }
    
    // calculate new temp
    var variance = deltaSign * maxVariance * Math.random();
    var newTemp = temp + variance;
    
    // bring back into range if we've gone outside
    if (newTemp < minTemp) newTemp = minTemp;
    if (newTemp > maxTemp) newTemp = maxTemp;
    
    return newTemp;
    
  }
  
  /*
   * Notify observers of a temperature change. After notification,
   * update the temperature.
   */
  var onTimer = function () {
    for (i in observers) {
      observers[i](currentTemp);
    }
    currentTemp = varyTemp(tempConf, currentTemp);
  }
  
  /*
   * Set the temperature config to use for realtime.
   */
  m.setTempConf = function (tempConf2) {
    tempConf = tempConf2;
  }
  
  /*
   * Return the temperature config currently being used.
   */
  m.getTempConf = function () {
   return tempConf;
  }
  
  /*
   * Returns the current realtime temperature.
   */
  m.getCurrentTemp = function () {
    return currentTemp;
  }
  
  /*
   * Creates a temperature dataset with desired length.
   *
   * tempConf:
   *  minTemp, maxTemp, maxVariance
   *
   * return ex: [2.4, 4.3, 7.6, 4.5, 2.2 ... ]
   */
  m.createDataset = function (tempConf, initialTemp, length) {
    var currentTemp = initialTemp;
    var dataset = [];
    for (var i = 0; i < length; ++i) {
      dataset[i] = currentTemp = varyTemp(tempConf, currentTemp);
    }
    return dataset;
  }
  
  /*
   * callback(tmp_deg_c)
   */
  m.observe = function (callback) {
    observers.push(callback);
  }
  
  /*
   * Pass original callback object to remove.
   */
  m.unobserve = function (callback) {
    var i = observers.indexOf(callback);
    observers.splice(i, 1);
  }
  
  /*
   * Initialize and begin sending temperatures to observers.
   */
  m.start = function (interval) {
  
    // initialize temperature
    currentTemp = Math.random()*(tempConf.maxTemp - tempConf.minTemp) + tempConf.minTemp;
  
    // create timer
    timer = setInterval(onTimer, interval);
    
  }
  
  /*
   * Stop sending temperatures to observers.
   */
  m.stop = function () {
    timer.stop();
  }
  
  return m;
  
})(Temp||{});

