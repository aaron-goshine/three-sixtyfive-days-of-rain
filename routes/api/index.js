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
    var media = req.body.mediaurl;
    var youtubeId = youtubeIdExtrator(media);
    if (youtubeId) {
      youTube.getById(youtubeId, (error, result) => {
        if (error) {
          res.send('error while talking to youtube');
        } else {
          jsonfile.readFile(file, (err, jsonFile) => {
            var updatedPlaylist = jsonFile;
            var item  = result.items.pop();

            var entries = updatedPlaylist.filter((storeItem) => {
              return storeItem.id === youtubeId;
            });

            if (entries.length < 1) {
              updatedPlaylist.push({
                'id': youtubeId,
                'title': item.snippet.title,
                'thumbnail': item.snippet.thumbnails.default
              });
            }

            jsonfile.writeFile(file, updatedPlaylist, (err, jsonFile) => {
              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify(updatedPlaylist));
            });
          })
        }
      });
    }
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
