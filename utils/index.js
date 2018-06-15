function youtubeIdExtrator (idUrl) {
  if (idUrl.length === 11) return idUrl
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  var match = idUrl.match(regExp)
  if (match && match[7].length === 11) {
    return match[7]
  }
  return false
}

function stripTags (str) {
  var tags = /[^a-zA-Z _ - \- +.!,:]+/gi
  return str.replace(tags, ' ')
}

module.exports = {
  youtubeIdExtrator,
  stripTags
}
