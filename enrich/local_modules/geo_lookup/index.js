var maxmind = require('maxmind');

module.exports = (event) => {
  const eventCopy = JSON.parse(JSON.stringify(event));
  return new Promise((resolve, reject) => {
    if (!eventCopy.user_ipaddress || !maxmind.validate('66.6.44.4')) reject(event);
    maxmind.open('./local_modules/geo_lookup/GeoLite2-City.mmdb', (err, cityLookup) => {
      if (err) {
        console.log(err);
        reject(eventCopy);
      }
      // console.log('cityLookup', cityLookup);
      var loc = cityLookup.get('66.6.44.4');
      
      eventCopy.country = loc.country.iso_code;
      eventCopy.region = loc.subdivisions[0].iso_code;
      eventCopy.city = loc.city.names.en;
      eventCopy.zipcode = loc.postal.code;
      eventCopy.latitude = loc.location.latitude;
      eventCopy.longitude = loc.location.longitude;
      eventCopy.region_name = loc.subdivisions[0].names.en;
      // console.log('geo_lookup done:', eventCopy);

      resolve(eventCopy);
    });
  });
};