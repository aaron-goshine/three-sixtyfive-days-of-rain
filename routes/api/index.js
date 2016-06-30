// routes/api/index.js
//const key = 'AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg';

'use strict';

const express = require('express');
const pg = require('pg');
const router = express.Router();
const jsonfile = require('jsonfile')
const file = 'data/playlist.json'
const YouTube = require('youtube-node');
const youTube = new YouTube();

pg.defaults.ssl = true;
youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

function youtubeIdExtrator (idUrl) {
  if (idUrl.length === 11) return idUrl;
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = idUrl.match(regExp);
  if (match && match[7].length === 11){
    return match[7];
  }
  return false;
}

function fetchAndStore (youtubeId, callback) {
  if (!youtubeId) return;

  youTube.getById(youtubeId, (error, result) => {
    if (error) {
      console.log('error while talking to youtube');
      return;
    }
    var item = result.items.pop();

    // Get a Postgres client from the connection pool
    pg.connect(process.env.HEROKU_POSTGRESQL_PINK_URL, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
      }

      var jsonObject = {
        'id': youtubeId,
        'title': item.snippet.title,
        'thumbnail': item.snippet.thumbnails.default
      }

      var query = client.query("INSERT INTO media_tracks (track_data, track_id) values($1, $2)", [jsonObject, jsonObject.id]);
      query.on('error', function(err) {
        console.log('Query error: ' + err);
      });
      done();
      callback();
    });
  });
}

function getAll (req, res, next) {
  pg.connect(process.env.HEROKU_POSTGRESQL_PINK_URL, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
    }

    var query = client.query("SELECT track_data FROM media_tracks LIMIT 366");
      query.on('error', function(err) {
        console.log('Query error: ' + err);
      });

    var results = [];
    // Stream results back one row at a time
    query.on('row', function(row) {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results.map(function (item) {
        return item.track_data;
      }));
    });
  });
}

module.exports = () => {
  router.get('/playlist', (req, res, next) => {
    getAll(req, res, next);
  });

  router.post('/add', (req, res, next) => {
    var media = req.body.mediaurl;
    var youtubeId = youtubeIdExtrator(media);
    fetchAndStore(youtubeId, function () {
      getAll(req, res, next);
    });
  });

  router.post('/delete', (req, res, next) => {
    let youtubeId = req.body.id;
    pg.connect(process.env.HEROKU_POSTGRESQL_PINK_URL, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
      }

      var query = client.query("DELETE FROM media_tracks WHERE track_id = $1", [youtubeId]);
      query.on('error', function(err) {
        console.log('Query error: ' + err);
      });

      getAll(req, res, next);
      done();
    });
  });

  return router;
};
