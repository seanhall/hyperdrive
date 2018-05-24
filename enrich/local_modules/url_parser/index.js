module.exports = (event) => {

  return new Promise((resolve, reject) => {
    const eventCopy = JSON.parse(event);
    if (!eventCopy.page_url) {
      console.log('url_parser: no page url');
      reject(eventCopy);
    }

    const url = require('url');

    const myURL = url.parse(eventCopy.page_url);
    // // enrichment 1: url_parser
    eventCopy.page_urlscheme = myURL.protocol;
    eventCopy.page_urlhost = myURL.hostname;
    eventCopy.page_urlport = myURL.port;
    eventCopy.page_urlpath = myURL.pathname;
    eventCopy.page_urlquery = myURL.search;
    eventCopy.page_urlhash = myURL.hash;

    if (eventCopy.page_referrer) {
      const referrer_parsed = url.parse(eventCopy.page_referrer);
      eventCopy.refr_urlscheme = referrer_parsed.protocol;
      eventCopy.refr_urlhost = referrer_parsed.hostname;
      eventCopy.refr_urlport = referrer_parsed.port;
      eventCopy.refr_urlpath = referrer_parsed.pathname;
      eventCopy.refr_urlquery = referrer_parsed.search;
      eventCopy.refr_urlfragment = referrer_parsed.hash;
    }
    resolve(eventCopy);
  });
};