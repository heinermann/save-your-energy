/*
 * Takes a value between min and max and returns a varied
 * value (randomized) in the range of +/- variance.
 */
var varyValue = function(min, max, variance, value) {

  // sanity check
  if (value < min) console.log("value '" + value + "' out of range '" + min + "'.");
  if (value > max) console.log("value '" + value + "' out of range '" + max + "'.");
  
  // calculate delta sign.
  // value == min => 100% for positive
  // value == max => 100% for negative
  
  var deltaSign;
  {
    var r = Math.random();
    var t = (value - min) / (max - min);
    deltaSign = r < t ? -1.0 : 1.0;
  }
  
  // calculate new value
  var variance = deltaSign * variance * Math.random();
  var newValue = value + variance;
  
  // bring back into range if we've gone outside
  if (newValue < min) newValue = min;
  if (newValue > max) newValue = max;
  
  return newValue;
  
}


/*
 * Does a deep object copy.
 */
var deepCopy = function (obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
  }
  return copy;
}

var randomInRange = function (min, max) {
  return Math.random()*(max - min) + min;
}

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
   * Takes the current temperature, min and max range, +/- variance,
   * randomizes and returns next temperature.
   */
  var varyTemp = function (tempConf, currentTemp) {
    return varyValue(
      tempConf.minTemp,
      tempConf.maxTemp,
      tempConf.maxVariance,
      currentTemp
    );
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
    currentTemp = randomInRange(tempConf.minTemp, tempConf.maxTemp);
    
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



/*
 * Realtime spoofing for electrical usage.
 */
var Electric = (function (m) {

  var timer;
  var observers = [];
  var usageConf = {
    maxWHVariance: 5000.0,
    maxWH: 50000.0,
    minWH: 0.0,
    rates: [10.0, 20.0, 40.0],
    duration: 900,
    durationsPerRate: 16,
    start: 1330578000
  }
  var currentUsage;
  
  
  var varyUsage = function (usage) {
  
    var conf = usage.conf;
    var newUsage = {};
    
    // copy over conf
    newUsage.conf = conf;
  
    // calculate new WH
    newUsage.value = varyValue(
      conf.minWH,
      conf.maxWH,
      conf.maxWHVariance,
      usage.value
    );
  
    // add a duration
    newUsage.durationCount = usage.durationCount + 1;
    
    // if reached max durations per rate then rollover to new rate
    // and reset duration counter.
    if (newUsage.durationCount >= usage.conf.durationsPerRate) {
      newUsage.rateIndex = (usage.rateIndex + 1) % conf.rates.length;
      newUsage.rate = conf.rates[newUsage.rateIndex];
      newUsage.durationCount = 0;
    }
    else {
      newUsage.rate = usage.rate;
      newUsage.rateIndex = usage.rateIndex;
    }
    
    // calculate cost.
    newUsage.cost = newUsage.rate * newUsage.value;
  
    // calculate duration start.
    newUsage.start = conf.duration + usage.start;
  
    // copy over duration time.
    newUsage.duration = usage.duration;
  
    return newUsage;
  
  }

  /*
   * Notify observers of a electrical usage change. After notification,
   * update for next usage duration.
   */
  var onTimer = function () {
    for (i in observers) {
      observers[i](currentUsage);
    }
    currentUsage = varyUsage(currentUsage);
  }
  
  /*
   * Given a usage config, calculates the first usage (randomized) that
   * would occur.
   */
  var calcFirstUsage = function (conf) {
    var usage = {};
    usage.value = randomInRange(conf.minWH, conf.maxWH);
    usage.rate = conf.rates[0];
    console.log(usage);
    usage.rateIndex = 0;
    usage.durationCount = 0;
    usage.duration = conf.duration;
    usage.start = conf.start;
    usage.cost = usage.value * usage.rate;
    usage.conf = conf;
    return usage;
  }

  /*
   * Creates a usage dataset with desired length.
   *
   * conf: {
   *   maxWHVariance: 5000.0,
   *   maxWH: 50000.0,
   *   minWH: 0.0,
   *   rates: [10.0, 20.0, 40.0],
   *   duration: 900,
   *   durationsPerRate: 16,
   *   start: 1330578000
   * }
   *
   * return ex: [obj usage 1, obj usage 2, obj usage 3 ... ]
   */
  m.createDataset = function (conf, length) {
    var currentUsage = calcFirstUsage(conf);
    var dataset = [];
    for (var i = 0; i < length; ++i) {
      dataset[i] = currentUsage = varyUsage(currentUsage);
    }
    return dataset;
  }
  
  
  /*
   * Set the usage config to use for realtime.
   */
  m.setConf = function (conf) {
    usageConf = conf;
  }
  
  /*
   * Return the usage config currently being used.
   */
  m.getConf = function () {
   return usageConf;
  }
  
  /*
   * Returns the current realtime usage.
   */
  m.getCurrentUsage = function () {
    return currentUsage;
  }
  
  /*
   * callback({
   *   cost: 123,              // in 100,000th of dollars
   *   value: 456,             // in Watt hours
   *   duration: 123,          // in seconds
   *   start: unix_timestamp,
   *   rate: 56.0,             // dollars/Wh
   *   rateIndex: 1,           // index in conf
   *   durationCount: 5,       // number of durations since last rate change
   *   conf: { ... }           // config object
   * })
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
   * Initialize and begin sending usage data to observers.
   */
  m.start = function (interval) {
  
    // initialize first usage.
    currentUsage = calcFirstUsage(usageConf);
  
    // create timer
    timer = setInterval(onTimer, interval);
    
  }
  
  /*
   * Stop sending temperatures to observers.
   */
  m.stop = function () {
    timer.stop();
  }
  
  /*
   * Convert usage cost to dollars.
   */
  m.costToDollars = function (cost) {
    return cost / 100000;
  }

  return m;

})(Electric||{});
 
 
 
 
 
 