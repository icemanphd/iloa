/* eslint max-len:0 */
import themes from '../themes'
import tools from '../tools'

import _ from 'lodash'
import moment from 'moment'
import noon from 'noon'
const http = require('good-guy-http')({
  cache: false,
})

const CFILE = `${process.env.HOME}/.iloa.noon`

exports.command = 'wunder <query>'
exports.desc = 'Query Weather Underground'
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string',
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean',
  },
  features: {
    alias: 'e',
    desc: 'CSV alerts,almanac,animatedradar,animatedsatellite,animatedradar/animatedsatellite,astronomy,conditions,currenthurricane,forecast,forecast10day,geolookup,history,hourly,hourly10day,planner,radar,radar/satellite,rawtide,satellite,tide,webcams,yesterday',
    default: 'conditions',
    type: 'string',
  },
  lang: {
    alias: 'l',
    desc: '2-letter language codes listed here: https://www.wunderground.com/weather/api/d/docs?d=language-support',
    default: 'EN',
    type: 'string',
  },
  pws: {
    alias: 'p',
    desc: 'Use personal weather stations for weather conditions',
    default: true,
    type: 'boolean',
  },
  bestf: {
    alias: 'b',
    desc: 'Use Wunderground Best Forecast',
    default: true,
    type: 'boolean',
  },
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  let dproceed = false
  let mproceed = false
  let dreset = false
  let mreset = false
  const dstamp = new Date(config.wunder.date.dstamp)
  const mstamp = new Date(config.wunder.date.mstamp)
  const day = moment(new Date).diff(dstamp, 'hours')
  const hour = moment(new Date).diff(mstamp, 'minutes')
  const minute = moment(new Date).diff(mstamp, 'seconds')
  const checkStamp = tools.limitWunder(config)
  config = checkStamp[0]
  dproceed = checkStamp[1]
  mproceed = checkStamp[2]
  dreset = checkStamp[3]
  mreset = checkStamp[4]
  if (dproceed && mproceed) {
    const features = argv.e.split(',').join('/')
    const userConfig = {
      bestf: argv.b,
      features: features.split('/'),
      lang: argv.l,
      pws: argv.p,
    }
    if (config.merge) config = _.merge({}, config, userConfig)
    if (argv.s && config.merge) noon.save(CFILE, config)
    if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
    const theme = themes.loadTheme(config.theme)
    if (config.verbose) themes.label(theme, 'down', 'Wunderground')
    const scont = []
    scont.push(`lang:${config.wunder.lang.toUpperCase()}`)
    config.wunder.pws ? scont.push('pws:1') : scont.push('pws:0')
    config.wunder.bestf ? scont.push('bestfct:1') : scont.push('bestfct:0')
    const qcont = []
    qcont.push(argv.query)
    _.each(argv._, (value) => {
      if (value !== 'wunder') qcont.push(value)
    })
    if (qcont.length > 1) throw new Error('Multiple queries not allowed.')
    const query = qcont[0]
    const apikey = process.env.WUNDERGROUND
    const url = encodeURI(`https://api.wunderground.com/api/${apikey}/${features}/${scont.join('/')}/q/${query}.json`)
    console.log(url)
    const tofile = {
      type: 'wunderground',
      source: 'https://www.wunderground.com/?apiref=f6e0dc6b44f8fee2',
    }
    http({ url }, (error, response) => {
      if (!error && response.statusCode === 200) {
        const body = JSON.parse(response.body)
        tofile.body = body
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        if (config.usage) {
          dreset ? console.log(`Timestamp expired, reset usage limits.\n${config.wunder.date.dremain}/${config.wunder.date.dlimit} requests remaining today.`) : console.log(`${config.wunder.date.dremain}/${config.wunder.date.dlimit} requests remaining today, will reset in ${24 - day} hours, ${60 - hour} minutes, ${60 - minute} seconds.`)
          mreset ? console.log(`Timestamp expired, reset usage limits.\n${config.wunder.date.mremain}/${config.wunder.date.mlimit} requests remaining this minute.`) : console.log(`${config.wunder.date.mremain}/${config.wunder.date.mlimit} requests remaining today, will reset in ${60 - minute} seconds.`)
        }
      } else {
        throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
      }
    })
  } else if (!dproceed) {
    throw new Error(`Reached month's usage limit of ${config.wunder.date.dlimit}.`)
  } else if (!mproceed) console.log(`Reached usage limit of ${config.wunder.date.mlimit}, please wait a minute.`)
}
