/* eslint no-unused-vars:0, no-unused-expressions:0 */
import yargs from 'yargs'
exports.command = 'comp'
exports.desc = 'Print shell completion script'
exports.builder = {}
exports.handler = (argv) => {
  yargs.showCompletionScript().argv
}
