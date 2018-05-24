const Referer = require('referer-parser');

module.exports = (event) => {
  const eventCopy = JSON.parse(JSON.stringify(event));

  return new Promise((resolve, reject) => {
    if (!eventCopy.page_referrer) reject(eventCopy);

    referer_url = eventCopy.page_referrer;

    var r = new Referer(referer_url, eventCopy.page_url);

    eventCopy.refr_medium = r.medium;
    eventCopy.refr_source = r.referer;
    eventCopy.refr_term = r.search_term;

    resolve(eventCopy);
  });
};