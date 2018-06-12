// routes/api/index.js
// const key = 'AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg';

const express = require('express')
const router = express.Router()
const YouTube = require('youtube-node')
const youTube = new YouTube()
const { Pool, Client } = require('pg')
const pool = new Pool()


// youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');
youTube.setKey('AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg')

function youtubeIdExtrator (idUrl) {
  if (idUrl.length === 11) return idUrl
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  var match = idUrl.match(regExp)
  if (match && match[7].length === 11) {
    return match[7]
  }
  return false
}

function stripTags_sub (input, allowed) {
  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
  })
}

function stripTags (str) {
  var tags = /[^a-zA-Z _ - \- +.!,:]+/gi
  return str.replace(tags, ' ')
}

function saveItem(result) {
  var item = result.items.pop()
  var jsonObject = {
    'id': youtubeId,
    'title': item.snippet.title,
    'comment': stripTags(comment).substring(0, 140),
    'thumbnail': item.snippet.thumbnails.default,
    'info': item
  }
  const client = new Client()
  client.query('INSERT INTO media_tracks (track_data, track_id, track_comment) values($1, $2, $3)',
    [jsonObject, jsonObject.id, jsonObject.comment])
  const res = await client.query('SELECT NOW()')
  await client.end()
  return res
}


function fetchAndStore (youtubeId, comment, callback) {
  if (!youtubeId) return
  youTube.getById(youtubeId, (error, result) => {
    if (error) {
      console.log('error while talking to youtube: ', error)
      return
    }
    saveItem(result)
  })
}

/**
 * get 7000 items from the database
 *
 * @name getAll
 * @function
 * @param {obj} res - response object
 * @returns {arrray} media items
 */
function getAll (res) {
  var query = client.query('SELECT * FROM media_tracks LIMIT 700')
  var results = []
  return res.json(results.map(function (item) {
    return item.track_data
  }))
}

module.exports = () => {
  router.get('/playlist', (req, res, next) => {
    getAll( res, next)
  })

  router.post('/add', (req, res, next) => {
    var media = req.body.mediaurl
    var comment = req.body.comment
    var youtubeId = youtubeIdExtrator(media)
    fetchAndStore(youtubeId, comment, function () {
      getAll(res, next)
    })
  })

  router.post('/delete', (req, res, next) => {
    let youtubeId = req.body.id
    pg.connect(process.env.HEROKU_POSTGRESQL_PINK_URL, function (err, client, done) {
      // Handle connection errors
      if (err) {
        done()
        console.log(err)
      }

      var query = client.query('DELETE FROM media_tracks WHERE track_id = $1', [youtubeId])
      query.on('error', function (err) {
        console.log('Query error: ' + err)
      })

      getAll(res, next)
      done()
    })
  })
  return router
}
