const uuid = require('uuid');
const http = require('http');

const getCookie = require('./local_modules/getCookie');
const setCookies = require('./local_modules/setCookies');
const buildClickstreamEvent = require('./local_modules/buildClickstreamEvent');

const DEBUG = process.env.DEBUG === 'true';

const kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client('192.168.1.120:2181/', 'raw'),
    producer = new Producer(client);

let ready = false;

console.log(producer);

let cookie_array, sp_cookies, sp_cookie_array, id_cookie, id_cookie_array = [],
id_cookie_join = [],
ses_cookie, user_id, session_id, expires, creation_ts, visit_count, current_visit_ts, last_visit_ts;

producer.on('ready', function () {
  ready = true;
});
producer.on('error', (err) => { console.log(err); });

var handlereq = function(req, res) {
  let resp = '';
  req.on('data', function(data) {
    let event = JSON.parse(new Buffer(data, 'base64').toString('utf8'));
    // console.log(event);
    // console.log(req);
    let user_ipaddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let useragent = req.headers['user-agent'];

    let sp_cookies = setCookies(event.cookies, DEBUG);
    id_cookie = sp_cookies.id_cookie;
    if (DEBUG) console.log('id_cookie: ' + id_cookie);
    ses_cookie = sp_cookies.ses_cookie;
    if (DEBUG) console.log('ses_cookie: ' + ses_cookie);

    event.collector_tstamp = Date.now();
    event.collector_version = process.env.VERSION || null;
    event.event_id = uuid.v4();
    event.session_id = sp_cookies.session_id;
    event.useragent = useragent;
    event.user_id = sp_cookies.user_id;
    event.user_ipaddress = user_ipaddress;

    // ? profit
    const message = JSON.stringify(event);

    let payloads = [
        { topic: 'clickstream-raw', messages: message }
    ];
    if (ready) {
      console.log('ready');
      producer.send(payloads, function (err, data) {
        if (data) console.log('data', data);
        else console.log('Error:', err);
      });
    }
    resp = data;
  });
  req.on('end', function() {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify({'user_cookie': id_cookie, 'user_session': ses_cookie}));
    // res.end(resp);
  });
};
var www = http.createServer(handlereq);
www.listen(8080);