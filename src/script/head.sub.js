const constant = require('../constant')

module.exports = function headSubRun(req, res, session) {
  // TODO theme

  session.beginTime = new Date()

  if(!session.title) {
    session.headTitle = session.title = session.config.cf_title
  } else {
    session.headTitle = session.title + ' | ' + session.config.cf_title // 상태바에 표시될 제목
  }

  // TODO 현재 접속자

  session.resourceManager.addJavascript('jquery-1.12.4.min.js', 0)
session.resourceManager.addJavascript('jquery-migrate-1.4.1.min.js', 0);
session.resourceManager.addJavascript(`jquery.menu.js?ver=${constant.jsVer}`, 0);
session.resourceManager.addJavascript(`/common.js?ver=${constant.jsVer}`, 0);
session.resourceManager.addJavascript(`wrest.js?ver=${constant.jsVer}`, 0);
session.resourceManager.addJavascript('placeholders.min.js', 0);
session.resourceManager.addStylesheet('/font-awesome/css/font-awesome.min.css', 0);
}
