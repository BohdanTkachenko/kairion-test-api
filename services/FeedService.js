const debug = require('debug')('kairion-test-api:FeedService');
const util = require('util');
const Promise = require('bluebird');
const fetch = require('node-fetch');
const csvParse = require('csv-parse');
const DatabaseService = require('./DatabaseService');

class FeedService {
  static parseData(data, options) {
    debug('Parsing feed data...');

    return Promise.promisify(csvParse)(data, options)
      .then(parsedData => {
        debug(`Feed data successfully parsed (${parsedData.length} items)`);
        return parsedData;
      });
  }

  static fetchData(url) {
    debug(`Fetching feed from ${url} ...`);

    return fetch(url)
      .then(res => res.text())
      .then(data => {
        debug(`Feed successfully fetched from ${url}`);
        return data;
      });
  }

  static importFeed(shopName, url, csvFormat) {
    debug(`Importing feed for shop ${shopName} from ${url} with params ${util.inspect(csvFormat)}`);

    return Promise.resolve()
      .then(() => FeedService.fetchData(url))
      .then(data => FeedService.parseData(data, csvFormat))
      .filter((item, idx) => item.id && idx > 0)
      .map((item) => ({
        shopName,
        id: item.id,
        price: item.price,
      }))
      .then(data => DatabaseService.importProducts(shopName, data));
  }
}

module.exports = FeedService;
