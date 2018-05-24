// const kafka = require('kafka-node'),
//     Producer = kafka.Producer,
//     client = new kafka.Client('192.168.1.120:2181/', 'raw'),
//     producer = new Producer(client);

const url_parser = require('./local_modules/url_parser');
const geo_lookup = require('./local_modules/geo_lookup');
const referer_parser = require('./local_modules/referer_parser');

let kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client('192.168.1.120:2181/'),
    consumer = new Consumer(
      client,
      [
        { topic: 'clickstream-raw', partition: 0 }
      ],
      {
        autoCommit: false
      }
    ),

    Producer = kafka.Producer,
    client2 = new kafka.Client('192.168.1.120:2181/', 'enriched'),
    producer = new Producer(client2);

const Ajv = require('ajv');
const ajv = new Ajv();

let valid = true;

consumer.on('message', function (message) {
  // console.log(message.value);
  let event = message.value;

  // begin enrichment chain
  url_parser(event).catch(() => {
    console.log.bind(console);
    return event;
  }).then(event => {
    // console.log('geo lookup', event);
    return geo_lookup(event);
  }).catch(() => {
    console.log.bind(console);
    return event;
  }).then(event => {
    // console.log('referer parser', event);
    return referer_parser(event);
  }).catch(() => {
    console.log.bind(console);
    return event;
  }).then(event => { 
    console.log('validate', typeof event);
    // validate
    // if all contexts are valid, send downstream
    // if any are invalid, send full event to bad and stop
    const message = JSON.parse(JSON.stringify(event));
    const contexts = event.contexts || null;

    if (contexts) {
      console.log('contexts');
      let schemaPath,
          schemaSplit,
          schema;

      for (let i = 0; i < contexts.length; i++) {
        schemaPath = contexts[i].schema;
        schemaSplit = schemaPath.split('/');
        if (schemaSplit[0] === 'local') schema = require('../schemas/' + schemaPath);
        else schema = require('./local_modules/get_schema')(schemaSplit[1], schemaSplit[3]);
        console.log('schema:', JSON.stringify(schema));
        if (!ajv.validate(schema, contexts[i].data)) {
          let payloads = [
            { topic: 'clickstream-bad', messages: message }
          ];
          producer.send(payloads, function (err, data) {
            console.log(err || data);
          });
          break;
          throw 'failed validation, see bad bucket';
        }
      }
      if (valid) {
        // send to next?
        return event;
      }
    }
  }).catch(() => {
    console.log.bind(console);
    return event;
  }).then(function(event) {
    if (valid) {
      console.log('enriched', event);
      const message = JSON.stringify(event);
      let payloads = [
        { topic: 'clickstream-enriched', messages: message }
      ];
      // producer.send(payloads, function (err, data) {
      //   console.log(err || data);
      // });
    }
  }).catch(() => {
    console.log.bind(console);
  });
});