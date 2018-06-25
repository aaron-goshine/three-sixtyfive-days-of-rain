const express = require('express')
const YouTube = require('youtube-node')
const { Client } = require('pg')
const { stripTags, youtubeIdExtrator } = require('../../utils/')

const router = express.Router()
const connectionString = process.env.HEROKU_POSTGRESQL_PINK_URL
const client = new Client({ connectionString: connectionString, ssl: true })
client.connect()

const youTube = new YouTube()
youTube.setKey('AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg')

function fetchAndStore (youtubeId, comment, callback) {
  if (!youtubeId) return
  youTube.getById(youtubeId, (error, result) => {
    if (error) {
      console.log('error while talking to youtube: ', error)
      return
    }
    saveItem(result, comment)
    callback()
  })
}

async function saveItem (youTubeResult, comment) {
  var item = youTubeResult.items.pop()
  var jsonObject = {
    'id': item.id,
    'title': item.snippet.title,
    'comment': stripTags(comment).substring(0, 140),
    'thumbnail': item.snippet.thumbnails.default,
    'info': item
  }
  var result = await client.query('INSERT INTO media_tracks (track_data, track_id, track_comment) values($1, $2, $3)',
    [jsonObject, jsonObject.id, jsonObject.comment])
  return result
}

function getPlaylist (req, res, next) {
  client.query('SELECT * FROM media_tracks LIMIT 700', (err, results) => {
    if (err) {
      console.log(err)
      return
    }
    res.json(results.rows.map((item) => {
      return item.track_data
    }))
  })
}

function add (req, res, next) {
  var media = req.body.mediaurl
  var comment = req.body.comment
  var youtubeId = youtubeIdExtrator(media)
  fetchAndStore(youtubeId, comment, () => {
    getPlaylist(req, res, next)
  })
}

function deleteItem (req, res, next) {
  let youtubeId = req.body.id
  client.query('DELETE FROM media_tracks WHERE track_id = $1', [youtubeId])
  getPlaylist(req, res, next)
}

module.exports = () => {
  router.get('/playlist', getPlaylist)
  router.post('/item', add)
  router.delete('/item', deleteItem)
  return router
}
