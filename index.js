const express = require('express')
const app = express()
const api = require('./routes/api')
const path = require('path')
const bodyParser = require('body-parser')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(path.resolve('./public/')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api', api())

app.set('views', path.resolve('./views/'))
app.set('view engine', 'ejs')
app.get('/', function (request, response) {
  response.render('pages/index')
})

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'))
})
