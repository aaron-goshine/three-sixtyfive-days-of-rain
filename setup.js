'use strict'
// const key = 'AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg';
const jsonfile = require('jsonfile')
const YouTube = require('youtube-node')

const youTube = new YouTube()
youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU')

var pg = require('pg')
pg.defaults.ssl = true

jsonfile.readFile('./data/youtube-ids.json', (err, jsonFile) => {
  if (err) {
    console.log(err)
  }

  jsonFile.forEach(function (id, index) {
    fetchAndStore(id, index)
  })
})

function fetchAndStore (youtubeId, index) {
  if (!youtubeId) return
  youTube.getById(youtubeId, (error, result) => {
    if (error) {
      console.log('error while talking to youtube')
      return
    }
    var item = result.items.pop()
    // Get a Postgres client from the connection pool
    pg.connect(process.env.HEROKU_POSTGRESQL_PINK_URL, function (err, client, done) {
      // Handle connection errors
      if (err) {
        done()
        console.log(err)
      }
      var jsonObject = {
        'id': youtubeId,
        'title': item.snippet.title,
        'thumbnail': item.snippet.thumbnails.default
      }

      var query = client.query('INSERT INTO media_tracks (track_data, track_id) values($1, $2)', [jsonObject, jsonObject.id])
      console.log(jsonObject.id + ' ' + index)
      query.on('error', function (error) {
        console.log(error)
      })
      done()
    })
  })
}
