const express = require('express');

const router = new express.Router();

router.get('/', (req, res) => {
  res.status(500);
  res.send('API not implemented yet');
});

router.post('/', (req, res) => {
  res.status(500);
  res.send('API not implemented yet');
});

module.exports = router;
