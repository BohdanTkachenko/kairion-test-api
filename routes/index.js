const Promise = require('bluebird');
const _ = require('lodash');
const express = require('express');
const FeedService = require('../services/FeedService');
const DatabaseService = require('../services/DatabaseService');

const router = new express.Router();

router.get('/', (req, res) => {
  const shopName = req.query.shop;
  const productId = req.query.product_id;

  if (!shopName) {
    res.status(400);
    res.json({ success: false, message: 'shop is not defined' });
    return;
  }

  if (productId) {
    const product = DatabaseService.getProduct(shopName, productId);
    if (!product) {
      res.status(400);
      res.json({
        success: false,
        message: `Product with id ${productId} was not found in shop ${shopName}`,
      });

      return;
    }

    res.json({
      [product.id]: product.price,
    });

    return;
  }

  const products = DatabaseService.getProducts(shopName);
  res.json(products.map(product => product.id));
});

router.post('/', (req, res) => {
  const { feedUrl, shopName, csvFormat } = req.body;

  for (const key of ['feedUrl', 'shopName', 'csvFormat', 'csvFormat.columns']) {
    if (_.get(req.body, key) === undefined) {
      res.status(400);
      res.json({ success: false, message: `${key} is not defined` });
      return;
    }
  }

  if (!Array.isArray(csvFormat.columns)) {
    res.status(400);
    res.json({ success: false, message: 'csvFormat.columns should be an array' });
    return;
  }

  for (const key of ['id', 'price']) {
    if (!csvFormat.columns.includes(key)) {
      res.status(400);
      res.json({ success: false, message: `${key} is missing in csvFormat.columns` });
      return;
    }
  }

  const csvParseOptions = Object.assign(
    _.pick(csvFormat, ['columns', 'delimiter', 'quote', 'escape']),
    {
      skip_empty_lines: true,
      // auto_parse: true,
      // relax_column_count: true,
    }
  );

  let requestHandled = false;
  const handleRequest = (status, message) => {
    console.log(status, message);

    if (requestHandled) {
      return;
    }

    requestHandled = true;
    res.status(status);
    res.json({ success: status === 200, message });
    res.end();
  };

  Promise.delay(100)
    .then(() => {
      handleRequest(200, 'Feed import proccess initialized. '
        + 'It can take up to several minutes to download and import feed');
    });

  // run in background, as it can take a while
  FeedService.importFeed(shopName, feedUrl, csvParseOptions)
    .then(() => {
      handleRequest(200, 'Feed imported successfully');
    })
    .catch(err => {
      console.error(err.stack); // eslint-disable-line no-console
      handleRequest(400, err.message);
    });
});

router.get('/shops', (req, res) => {
  const shops = DatabaseService.getShops();
  res.json(shops);
});

module.exports = router;
