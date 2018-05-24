const uuid = require('uuid');

module.exports = (event, domain_userid, domain_sessionid, user_ipaddress, useragent) => {
  try {
    let cse = {  // clickstream event
      app_id: event.app_id || null,
      br_colordepth: event.screen.colorDepth,
      br_cookies: event.cookieEnabled,
      br_lang: event.language,
      br_viewheight: event.viewport.height, // window.innerHeight
      br_viewwidth: event.viewport.width, // window.innerWidth
      collector_tstamp: Date.now(),
      collector_version: process.env.VERSION || null,
      context: event.context || null,
      crm_id: event.crm_id,
      device_created_tstamp: event.timestamp,
      device_screenheight: event.screen.height, // window.screen.height
      device_screenwidth: event.screen.width,
      doc_charset: event.characterSet,
      doc_height: event.document.height, // document height
      doc_width: event.document.width,
      event_id: uuid.v4(),
      event_name: event.action.split('/')[0],
      page_referrer: event.refr,
      page_title: event.page,
      page_url: event.url || null,
      platform: event.platform || null,
      session_id: domain_sessionid,
      useragent: useragent,
      user_id: domain_userid,
      user_ipaddress: user_ipaddress
    };
    return cse;
  } catch(e) {
    console.log(e); // feed to bad bucket?
  }
}