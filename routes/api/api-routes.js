// routes/api/pr.js
'use strict';

const express = require('express');
const router = express.Router();

module.exports = () => {
  router .get('/', (req, res, next) => {
    // Get all PRs
  });

  router.get('/api/id/:id', (req, res, next) => {
    // Get single by Id
    let id = req.params.id;
  });

  router.post('/', (req, res, next) => {
    let id = req.params.media;
  });

  router.put('/:id', (req, res, next) => {
    let id = req.params.id;
    let query = {id: req.params.id};
  });

  router.delete('/api/id/:id', (req, res, next) => {
    res.render('api', {response: 'Hello World'});
  });
  return router;
};
