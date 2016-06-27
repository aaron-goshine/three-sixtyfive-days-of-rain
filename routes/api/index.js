// routes/api/index.js
'use strict';

const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile')
const file = 'data/playlist.json'
//const key = 'AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg';
const YouTube = require('youtube-node');
const youTube = new YouTube();

youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

function youtubeIdExtrator(idUrl){
  if (idUrl.length === 11) return idUrl;
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = idUrl.match(regExp);
  if (match && match[7].length === 11){
    return match[7];
  }
  return false;
}

module.exports = () => {
  router.get('/playlist', (req, res, next) => {
    jsonfile.readFile(file, (err, obj) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(obj));
    })
  });

  router.post('/add', (req, res, next) => {
    let media = req.body.mediaurl;
    var youtubeId = youtubeIdExtrator(media);
    if (youtubeId) {
      // 'HcwTxRuq-uk'
      youTube.getById(youtubeId, (error, result) => {
        if (error) {
          res.send("invalid youTube url");
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(result, null, 2));
          jsonfile.readFile(file, (err, jsonFile) => {
            var updatedPlaylist = JSON.parse(jsonFile);
            updatedPlaylist.push({
              'id': 'dfdfdf',
              'title': 'this is the t',
              'thumbnail': 'http://'
            });
            jsonfile.readFile(file, updatedPlaylist, (err, jsonFile) => {
              res.send(JSON.stringify(updatedPlaylist));
            });
          })
        }
      });
    }
    res.send("invalid youTube url");
  });

  router.put('/:id', (req, res, next) => {
    let id = req.params.id;
    res.render('pages/api', {response: 'Hello World'});
  });

  router.delete('/api/id/:id', (req, res, next) => {
    res.render('api', {response: 'Hello World'});
  });
  return router;
};
