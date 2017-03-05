'use strict';
// const key = 'AIzaSyC2ERXDAQzuYjvPEKqP_DLdsByofdJ3DRg';
const jsonfile = require('jsonfile');
const file = './data/youtube-ids.json';

var request = require('request');
request('http://rain365.herokuapp.com/api/playlist', function (error, response, body) {
  if (!error && response.statusCode === 200) {
    var data = JSON.parse(body);
    jsonfile.writeFile(file, data.map((item) => {
      return item.id;
    }), function () {
      console.log(data.length);
    });
  }
});
