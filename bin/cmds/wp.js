'use strict';

/* eslint max-len:0 */
var themes = require('../themes');
var tools = require('../tools');

var _ = require('lodash');
var gg = require('good-guy-http');
var noon = require('noon');
var http = gg({
  cache: false,
  defaultCache: {
    cached: false
  }
});

var CFILE = process.env.HOME + '/.iloa.noon';

exports.command = 'wp <query>';
exports.desc = 'Wikipedia summaries';
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string'
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean'
  },
  intro: {
    alias: 'i',
    desc: 'Just intro or all sections',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  tools.checkConfig(CFILE);
  var config = noon.load(CFILE);
  var userConfig = {
    wiki: {
      intro: argv.i
    }
  };
  if (config.merge) config = _.merge({}, config, userConfig);
  if (argv.s && config.merge) noon.save(CFILE, config);
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.");
  var theme = themes.loadTheme(config.theme);
  if (config.verbose) themes.label(theme, 'down', 'Wikipedia');
  var wcont = [];
  wcont.push(argv.query);
  if (argv._.length > 1) {
    _.each(argv._, function (value) {
      if (value !== 'wp') wcont.push(value);
    });
  }
  var words = '';
  if (wcont.length > 1) {
    words = wcont.join('+');
  } else {
    words = wcont[0];
  }
  var prefix = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&indexpageids&redirects=1&continue=&explaintext=';
  if (argv.i) prefix = prefix + '&exintro=';
  var url = prefix + '&titles=' + words;
  url = encodeURI(url);
  var tofile = {
    type: 'wiki',
    source: 'http://www.wikipedia.org/',
    url: url
  };
  http({ url: url }, function (error, response) {
    if (!error && response.statusCode === 200) {
      var body = JSON.parse(response.body);
      if (body.query.pageids[0] === '-1') {
        if (body.query.normalized) {
          var fixed = body.query.normalized[0];
          console.log('Query normalized from ' + fixed.from + ' to ' + fixed.to + ', try searching again.');
          process.exit(0);
        } else {
          console.log('No Wikipedia article found for ' + wcont.join(' ') + ', try searching again.');
          process.exit(0);
        }
      }
      var pageID = body.query.pageids[0];
      var page = body.query.pages[pageID];
      var plain = page.extract.trim();
      var wrapped = tools.wrapStr(plain, true, true);
      themes.label(theme, 'down', 'Summary', wrapped);
      tofile.summary = plain;
      if (argv.o) tools.outFile(argv.o, argv.f, tofile);
    } else {
      throw new Error('HTTP ' + error.statusCode + ': ' + error.reponse.body);
    }
  });
};