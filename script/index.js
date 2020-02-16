const common = require('./_common')

function run(req, res) {
  let returnData = {}
  returnData.data_index = common(req, res)

  return returnData
}

module.exports = run
