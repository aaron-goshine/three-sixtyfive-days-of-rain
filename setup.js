
'use strict';
//const key = 'AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg';
const jsonfile = require('jsonfile')
const YouTube = require('youtube-node');

const file = './data/playlist.json';
const youTube = new YouTube();
youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

var updatedPlaylist = [];

jsonfile.readFile('./data/youtube-ids.json', (err, jsonFile) => {
  jsonFile.forEach (function(id) {
    fetchAndStore(id, function (updatedPlaylist) {
      jsonfile.writeFile(file, updatedPlaylist);
    });
  });
})

function fetchAndStore (youtubeId , callback) {
  if (youtubeId) {
    youTube.getById(youtubeId, (error, result) => {
      if (error) {
        res.send('error while talking to youtube');
      } else {
        if (result.items.length < 1) return;
        var item = result.items.pop();
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
      }
      callback(updatedPlaylist);
    });
  }
}

