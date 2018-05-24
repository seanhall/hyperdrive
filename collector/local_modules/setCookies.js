const getCookie = require('./getCookie');
const uuid = require('uuid');

module.exports = function(cookies, DEBUG) {console.log(cookies);
  let cookie_array, sp_cookies, sp_cookie_array, id_cookie, id_cookie_array = [],
    id_cookie_join = [],
    ses_cookie, user_id, session_id, expires, creation_ts, visit_count, current_visit_ts, last_visit_ts;

    // if (!cookies) {
    //   console.error("No user cookies found in the body:", JSON.stringify(_body));
    //   callback(new Error("No user cookies found in the body: " + JSON.stringify(_body)), null);
    //   return;
    // }

    id_cookie = getCookie(cookies, 'cs_id');
    if (DEBUG) console.log('id_cookie: ' + id_cookie);
    ses_cookie = getCookie(cookies, 'cs_ses');
    if (DEBUG) console.log('ses_cookie: ' + ses_cookie);

    let cookie_expires = (time) => {
      let expiration_date = new Date();
      expiration_date.setTime(expiration_date.getTime() + (time));
      expiration_date = expiration_date.toGMTString();
      return expiration_date;
    };

    // _sp_id.c229 analytics cookie value: user_id.creation_ts.visit_count.current_visit_ts.last_visit_ts.domain_sessionid
    if (id_cookie) {
      if (DEBUG) console.log('id cookie received');
      id_cookie_array = id_cookie.split('.');
      user_id = id_cookie_array[0];
      if (DEBUG) console.log('yes: ' + user_id);
      creation_ts = id_cookie_array[1];
      visit_count = parseInt(id_cookie_array[2], 10);
      if (DEBUG) console.log('visit_count: ' + visit_count);
      current_visit_ts = id_cookie_array[3];
      last_visit_ts = id_cookie_array[4];
      domain_sessionid = id_cookie_array[5];

      // if no session cookie, generate new session id, update _sp_id cookie; either way set session cookie
      if (!ses_cookie) {
        if (DEBUG) console.log('no session cookie');
        domain_sessionid = uuid.v4();
        last_visit_ts = current_visit_ts;
        current_visit_ts = Date.now();
        visit_count = visit_count + 1;
        if (DEBUG) console.log(visit_count);
      }
    } else {
      if (DEBUG) console.log('no cookie id is found');
      user_id = uuid.v4();
      creation_ts = Date.now().toString();
      visit_count = '1';
      current_visit_ts = creation_ts;
      last_visit_ts = creation_ts;
      domain_sessionid = uuid.v4();
    }
    id_cookie_join.push(user_id, creation_ts, visit_count, current_visit_ts, last_visit_ts, domain_sessionid);
    id_cookie = id_cookie_join.join('.') + '; Expires=' + cookie_expires(2 * 365 * 24 * 60 * 60 * 1000) + '; Path=/';
    ses_cookie = '*; Expires=' + cookie_expires(30 * 60 * 1000) + '; Path=/'; // 30 minutes

    return {
      user_id: user_id,
      domain_sessionid: domain_sessionid,
      visit_count: visit_count,
      id_cookie: id_cookie,
      ses_cookie: ses_cookie
    };
}