// routes/webserver.js
'use strict';

const express = require('express');
const router = express.Router();

module.exports = () => {
  router.get('/', (req, res, next) => {
    res.render('index', {message: 'Hello World'});
  });
  return router;
};

/*
/api/pr/:pr_id	GET	Get a single PR
/api/pr/:pr_id	PUT	Update a single PR
/api/pr/:pr_id	DELETE	Delete a single PR
//hint: you can get url parameters like this
.get('/:pr_id', (req, res, next) => {
  let pr_id = req.params.pr_id;
*/
