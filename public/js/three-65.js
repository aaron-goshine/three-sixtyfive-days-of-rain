var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var THREE_SIXTY_FIVE_PLAY = true;
var PLAY_TODAY = true;
var DEFAULT_PLAY_ID = 'kbrhuUFjCII';

var player;
var playListIndex = 0;

var quickStore = {
  data: [],
  dataHash: {},
  updateStore: function (data) {
    this.data = data;
    for (var i = 0; i < data.length; i++) {
      var currentItem = data[i];
      this.dataHash[i] = currentItem;
      this.dataHash[currentItem.id] = currentItem;
    }
  },
  getItemById: function (id) {
    return this.dataHash[id];
  },
  getItemByIndex: function (index) {
    return this.dataHash[index];
  },
  getMaxIndex: function () {
    return this.data.length;
  }
};

var calculateDayIndex = function () {
  var currentDate = new Date();
  var startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  var oneDay = 1000 * 60 * 60 * 24;
  var timeOffSet = currentDate.getTime() - startOfYear.getTime();
  var dayOfYear = Math.ceil(timeOffSet / oneDay) + 1;
  return dayOfYear;
};

var getNextPlayId = function () {
  if (playListIndex >= quickStore.getMaxIndex() || playListIndex < 0) {
    playListIndex = 0;
  }
  return quickStore.getItemByIndex(playListIndex).id;
};

var getTodaysPlayId = function () {
  return quickStore.getItemByIndex(calculateDayIndex()).id;
};

var onEnded = function (event) {
  console.log('on ended');
  event.target.loadVideoById(getNextPlayId());
  playListIndex += 1;
};

var onPlaying = function (event) {
  console.log('on playing');
};

var onPaused = function (event) {
  console.log('on paused');
};

var stopVideo = function () {
  player.stopVideo();
};

var onPlayerReady = function (event) {
  event.target.playVideo();
};

var onError = function (event) {
  playDefaultQueId(event);
};

var playDefaultQueId = function () {
  if (PLAY_TODAY) {
    return getTodaysPlayId();
  }
  return DEFAULT_PLAY_ID;
};

var onPlayerStateChange = function (event) {
  switch (event.data) {
    case YT.PlayerState.ENDED:
      onEnded(event);
      break;
    case YT.PlayerState.PLAYING:
      onPlaying(event);
      break;
    case YT.PlayerState.PAUSED:
      onPaused(event);
      break;
  }
};

var onYouTubeIframeAPIReady = function () {
  player = new YT.Player('player', {
    width: '320',
    videoId: playDefaultQueId(),
    playerVars: {
      loop: 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onError
    }
  });
};

/**
 * --- @global @param playlistRecommendation is loaded in as javaScript file
 * containing an array for youtube ids
 */

quickStore.updateStore(playlistRecommendation);

/**
 * -- Make some noise the line above is where we update the
 * localstorage with recommendation
 */

$(document).ready(function () {
  var $availableList = $('#available-list');
  var numItems = quickStore.getMaxIndex();
  for (var i = 0; i < numItems; i++) {
    var itemAtIndex = quickStore.getItemByIndex(i);
    var element = $('<a/>').attr('id', itemAtIndex.id).html(itemAtIndex.name);
    $availableList.append(element);
  }
  $availableList.click(function (event) {
    if ($(event.target).prop('tagName') === 'A') {
      var videoId = $(event.target).attr('id');
      player.loadVideoById(videoId);
    }
  });

  $('#YTVID').keydown(function (event) {
    console.log(event);
    if (event.which === 13) {
      event.preventDefault();
      var videoId = $(event.target).val();
      // * 11 is the current length of
      // Youtube videoID
      if (videoId.length === 11) {
        player.loadVideoById(videoId);
      }
    }
  });
});
