'use strict';

/* eslint max-len:0 */
var themes = require('../../themes');

var noon = require('noon');

var CFILE = process.env.HOME + '/.iloa.noon';
var config = noon.load(CFILE);
var theme = themes.loadTheme(config.theme);

/**
 * Handles alerts
 * @param  {object} data   Alert data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.alerts = function (data, tofile) {
  themes.label(theme, 'right', 'Alerts');
  var tf = tofile;
  tf.alerts = {};
  var d = data;
  for (var i = 0; i <= d.length - 1; i++) {
    var item = d[i];
    if (item.attribution) {
      themes.label(theme, 'right', item.description, item.level_meteoalarm_description);
      themes.label(theme, 'right', 'Attribution', item.attribution);
      tf.alerts[['description' + i]] = item.description;
      tf.alerts[['message' + i]] = item.level_meteoalarm_description;
      tf.alerts.attribution = item.attribution;
    } else {
      themes.label(theme, 'right', item.description, item.message);
      themes.label(theme, 'right', 'VTEC', 'phenomena: ' + item.phenomena + ' significance: ' + item.significance);
      tf.alerts[['description' + i]] = item.description;
      tf.alerts[['message' + i]] = item.message;
      tf.alerts[['phenomena' + i]] = item.phenomena;
      tf.alerts[['significance' + i]] = item.significance;
    }
  }
  return tf;
};

/**
 * Handles almanac
 * @param  {object} data   Almanac data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.almanac = function (data, tofile) {
  themes.label(theme, 'right', 'Almanac');
  var tf = tofile;
  tf.almanac = {};
  var d = data;
  var hn = '';
  var hr = '';
  var ln = '';
  var lr = '';
  config.wunder.metric ? hn = d.temp_high.normal.C : hn = d.temp_high.normal.F;
  config.wunder.metric ? hr = d.temp_high.record.C : hr = d.temp_high.record.F;
  config.wunder.metric ? ln = d.temp_low.normal.C : ln = d.temp_low.normal.F;
  config.wunder.metric ? lr = d.temp_low.record.C : lr = d.temp_low.record.F;
  themes.label(theme, 'right', 'Airport Code', d.airport_code);
  themes.label(theme, 'right', 'Average High', hn);
  themes.label(theme, 'right', 'Record High', hr + ' in ' + d.temp_high.recordyear);
  themes.label(theme, 'right', 'Average Low', ln);
  themes.label(theme, 'right', 'Record Low', lr + ' in ' + d.temp_low.recordyear);
  tf.almanac = d;
  return tf;
};

/**
 * Handles astronomy
 * @param  {object} data   Astronomy data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.astronomy = function (data, tofile) {
  themes.label(theme, 'right', 'Moon Phase');
  var tf = tofile;
  tf.astronomy = {};
  var d = data;
  themes.label(theme, 'right', 'Illumination', d.percentIlluminated + '%');
  themes.label(theme, 'right', 'Age', d.ageOfMoon);
  themes.label(theme, 'right', 'Sunrise', d.sunrise.hour + ':' + d.sunrise.minute);
  themes.label(theme, 'right', 'Sunset', d.sunset.hour + ':' + d.sunset.minute);
  tf.astronomy = d;
  return tf;
};

/*
 * Handles current conditions
 *
 * @param data {object} current_observation fields
 * @param tofile {object} The tofile object
 * @return {object} The tofile object
 */
exports.conditions = function (data, tofile) {
  themes.label(theme, 'right', 'Current conditions');
  var tf = tofile;
  tf.conditions = {};
  tf.conditions.location = {};
  tf.conditions.location.display = data.display_location;
  tf.conditions.location.observation = data.observation_location;
  themes.label(theme, 'right', 'Weather station ID', data.station_id);
  tf.conditions.station = data.station_id;
  themes.label(theme, 'right', 'Location', data.observation_location.full);
  themes.label(theme, 'right', 'Conditions', data.weather);
  tf.conditions.conditions = data.weather;
  themes.label(theme, 'right', 'Temperature', data.temperature_string);
  tf.conditions.temp = data.temperature_string;
  themes.label(theme, 'right', 'Feels like', data.feelslike_string);
  tf.conditions.feelslike = data.feelslike_string;
  tf.conditions.pressure = {};
  themes.label(theme, 'right', 'Pressure', data.pressure_in + 'in, ' + data.pressure_mb + 'mb, trend: ' + data.pressure_trend);
  tf.conditions.pressure.inches = data.pressure_in;
  tf.conditions.pressure.millibars = data.pressure_mb;
  tf.conditions.pressure.trend = data.pressure_trend;
  themes.label(theme, 'right', 'UV Index', data.UV);
  tf.conditions.uvindex = data.UV;
  tf.conditions.wind = {};
  tf.conditions.visibility = {};
  if (config.wunder.metric) {
    themes.label(theme, 'right', 'Wind', data.wind_kph + '/kph ' + data.wind_dir + ', gusts ' + data.wind_gust_kph + '/kph');
    themes.label(theme, 'right', 'Visibility', data.visibility_km + 'km');
  } else {
    themes.label(theme, 'right', 'Wind', data.wind_mph + '/mph ' + data.wind_dir + ', gusts ' + data.wind_gust_mph + '/mph');
    themes.label(theme, 'right', 'Visibility', data.visibility_mi + 'mi');
  }
  if (data.heat_index_string !== 'NA') {
    themes.label(theme, 'right', 'Heat Index', data.heat_index_string);
    tf.conditions.heatindex = data.heat_index_string;
  }
  if (data.windchill_string !== 'NA') {
    themes.label(theme, 'right', 'Wind Chill', data.windchill_string);
    tf.conditions.windchill = data.windchill_string;
  }
  tf.conditions.wind.kph = data.wind_kph;
  tf.conditions.wind.gustkph = data.wind_gust_kph;
  tf.conditions.wind.mph = data.wind_mph;
  tf.conditions.wind.gustmph = data.wind_gust_mph;
  tf.conditions.wind.dir = data.wind_dir;
  tf.conditions.visibility.km = data.visibility_km;
  tf.conditions.visibility.mi = data.visibility_mi;
  themes.label(theme, 'right', 'Precipitation today', data.precip_today_string);
  tf.conditions.precipitation = data.precip_today_string;
  themes.label(theme, 'right', 'Humidity', data.relative_humidity);
  tf.conditions.humidity = data.relative_humidity;
  themes.label(theme, 'right', 'Dewpoint', data.dewpoint_string);
  tf.conditions.dewpoint = data.dewpoint_string;
  tf.conditions.forecast = data.forecast_url;
  tf.conditions.history = data.history_url;
  return tf;
};

/**
 * Handles forecast and 10-day
 * @param  {object} data   Forecast data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.forecast = function (data, tofile) {
  themes.label(theme, 'right', 'Forecast');
  var tf = tofile;
  tf.forecast = {};
  tf.forecast.text = {};
  var fa = data.txt_forecast.forecastday;
  for (var i = 0; i <= fa.length - 1; i++) {
    var item = fa[i];
    if (config.wunder.metric) {
      themes.label(theme, 'right', item.title, item.fcttext_metric);
      tf.forecast[['' + item.title]] = item.fcttext_metric;
    } else {
      themes.label(theme, 'right', item.title, item.fcttext);
      tf.forecast[['' + item.title]] = item.fcttext;
    }
  }
  tf.forecast.simple = {};
  var sa = data.simpleforecast.forecastday;
  for (var j = 0; j <= sa - 1; j++) {
    var _item = sa[j];
    tf.forecast.simple[['period' + j]] = {};
    tf.forecast.simple[['period' + j]].date = _item.date;
    tf.forecast.simple[['period' + j]].high = _item.high;
    tf.forecast.simple[['period' + j]].low = _item.low;
    tf.forecast.simple[['period' + j]].conditions = _item.conditions;
    tf.forecast.simple[['period' + j]].avewind = _item.avewind;
    tf.forecast.simple[['period' + j]].avehumidity = _item.avehumidity;
  }
  return tf;
};

/**
 * Handles geolookup
 * @param  {object} data   Geolookup data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.geolookup = function (data, limit, tofile) {
  themes.label(theme, 'right', 'Nearby Weather Stations');
  var tf = tofile;
  tf.geolookup = {};
  themes.label(theme, 'right', 'Airports');
  var ap = data.nearby_weather_stations.airport.station;
  tf.geolookup.airport = {};
  for (var i = 0; i <= ap.length - 1; i++) {
    var item = ap[i];
    themes.label(theme, 'right', item.icao, item.city + ' ' + item.state + ' ' + item.country + ' - ' + item.lat + ', ' + item.lon);
    tf.geolookup.airport[[item.icao]] = item;
  }
  themes.label(theme, 'right', 'Personal weather stations');
  var pws = data.nearby_weather_stations.pws.station;
  tf.geolookup.pws = {};
  for (var j = 0; j <= limit - 1; j++) {
    var _item2 = pws[j];
    themes.label(theme, 'right', _item2.id, _item2.neighborhood + ' ' + _item2.city + ' - ' + _item2.lat + ', ' + _item2.lon);
    config.wunder.metric ? themes.label(theme, 'right', 'Distance', _item2.distance_km + 'km') : themes.label(theme, 'right', 'Distance', _item2.distance_mi + 'mi');
    tf.geolookup.pws[[_item2.id]] = _item2;
  }
  return tf;
};

/**
 * Handles hourly and 10-day
 * @param  {object} data   Hourly data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.hourly = function (data, tofile) {
  themes.label(theme, 'right', 'Hourly forecast');
  var tf = tofile;
  tf.hourly = {};
  var hf = data;
  for (var i = 0; i <= hf.length - 1; i++) {
    var item = hf[i];
    var civil = item.FCTTIME.civil.split(' ').join('_');
    var t = '';
    var fl = '';
    var ws = '';
    var rain = '';
    var windchill = '';
    var heatindex = '';
    var snow = '';
    var pressure = '';
    var uvi = '';
    config.wunder.metric ? t = item.temp.metric : t = item.temp.english;
    config.wunder.metric ? fl = item.feelslike.metric : fl = item.feelslike.english;
    config.wunder.metric ? ws = item.wspd.metric : ws = item.wspd.english;
    config.wunder.metric ? pressure = item.mslp.metric : pressure = item.mslp.english;
    if (item.qpf.english !== '0.0') {
      config.wunder.metric ? rain = item.qpf.metric : rain = item.qpf.english;
    }
    if (item.windchill.metric !== '-9999') {
      config.wunder.metric ? windchill = item.windchill.metric : windchill = item.windchill.english;
    }
    if (item.heatindex.metric !== '-9999') {
      config.wunder.metric ? heatindex = item.heatindex.metric : heatindex = item.heatindex.english;
    }
    if (item.snow.metric !== '0.0') {
      config.wunder.metric ? snow = item.snow.metric : snow = item.snow.english;
    }
    if (item.uvi !== '0') {
      uvi = item.uvi;
    }
    if (config.wunder.metric) {
      themes.label(theme, 'right', civil + ' ' + item.FCTTIME.weekday_name, item.wx + ' Temp:' + t + 'C, Feels like:' + fl + 'C, Wind:' + ws + 'kph ' + item.wdir.dir + ', Humidity:' + item.humidity);
      tf.hourly[[civil + '_' + item.FCTTIME.weekday_name]] = {
        conditions: item.wx,
        temp: t + 'C',
        feelslike: fl + 'C',
        wind: ws + 'kph ' + item.wdir.dir,
        humidity: item.humidity,
        rain: rain,
        windchill: windchill,
        heatindex: heatindex,
        snow: snow,
        pressure: pressure,
        uvi: uvi
      };
    } else {
      themes.label(theme, 'right', civil + '_' + item.FCTTIME.weekday_name, item.wx + ' Temp:' + t + 'F, Feels like:' + fl + 'F, Wind:' + ws + 'mph ' + item.wdir.dir + ', Humidity:' + item.humidity);
      tf.hourly[[civil + '_' + item.FCTTIME.weekday_name]] = {
        conditions: item.wx,
        temp: t + 'F',
        feelslike: fl + 'F',
        wind: ws + 'mph ' + item.wdir.dir,
        humidity: item.humidity,
        rain: rain,
        windchill: windchill,
        heatindex: heatindex,
        snow: snow,
        pressure: pressure,
        uvi: uvi
      };
    }
  }
  return tf;
};

/**
 * Handles tide
 * @param  {object} data   Tide data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.tide = function (data, tofile) {
  var tf = tofile;
  var d = data;
  var ti = d.tideInfo[0];
  var ts = d.tideSummary;
  tf.tide = {};
  themes.label(theme, 'right', 'Tide', ti.tideSite);
  tf.tide.location = ti.tideSite;
  for (var i = 0; i <= ts.length - 1; i++) {
    var item = ts[i];
    if (item.data.height !== '') {
      themes.label(theme, 'right', 'Date/time', item.date.pretty);
      tf.tide.datetime = item.date.pretty;
      themes.label(theme, 'right', 'Type', item.data.type);
      themes.label(theme, 'right', 'Height', item.data.height);
      tf.tide[['data' + i]] = item.data.type + ': ' + item.data.height;
    }
  }
  return tf;
};

/**
 * Handles webcams
 * @param  {object} data   Webcam data
 * @param  {object} tofile The tofile object
 * @return {object}        The tofile object
 */
exports.webcams = function (data, limit, tofile) {
  themes.label(theme, 'right', 'Webcams');
  var tf = tofile;
  tf.webcams = {};
  var d = data;
  var x = null;
  d.length <= limit ? x = d.length - 1 : x = limit;
  for (var i = 0; i <= x; i++) {
    var item = d[i];
    if (item.isrecent === '1') {
      tf.webcams[['' + item.camid]] = {};
      themes.label(theme, 'right', 'Camera', item.camid);
      themes.label(theme, 'right', 'Location', 'Lat: ' + item.lat + ', Lon: ' + item.lon);
      tf.webcams[['' + item.camid]].lat = item.lat;
      tf.webcams[['' + item.camid]].lon = item.lon;
      if (item.link !== 'http://' && item.link !== '') {
        themes.label(theme, 'right', 'Link', item.link);
        tf.webcams[['' + item.camid]].link = item.link;
      }
      themes.label(theme, 'right', 'Image', item.CURRENTIMAGEURL);
      tf.webcams[['' + item.camid]].image = item.CURRENTIMAGEURL;
    }
  }
  return tf;
};