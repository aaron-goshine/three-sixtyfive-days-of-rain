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
  updateStore: function (data) {
    for (var i = 0; i < data.length; i++) {
      var currentItem = data[i];
      if (!this.getItemById(currentItem.id)) {
        this.setItem(currentItem.id, currentItem.name);
      }
    }
  },
  getItemById: function (id) {
    return localStorage.getItem(id);
  },
  getItemByIndex: function (index) {
    return localStorage.getItem(index + '_YT365');
  },
  getMaxIndex: function () {
    return Number(localStorage.getItem('YT365_GTINDX'));
  },
  setMaxIndex: function (num) {
    localStorage.setItem('YT365_GTINDX', num);
  },
  setItem: function (item, value) {
    var currentIndex = this.getMaxIndex();
    var currentIndexKey = '' + currentIndex + '_YT365';
    if (typeof item === 'string' && typeof value === 'string') {
      localStorage.setItem(item, value);
      localStorage.setItem(item + '_YTINDX', currentIndexKey);
      localStorage.setItem(currentIndexKey, item);
      this.setMaxIndex(currentIndex + 1);
    }
  },
  removeItem: function (item) {
    var indexOfIem = localStorage.getItem(item + '_YTINDX');
    localStorage.removeItem(item);
    localStorage.removeItem(indexOfIem + 'YT36', item);
    localStorage.removeItem(item + '_YTINDX');
    this.setMaxIndex(this.getMaxIndex() - 1);
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
  var id;
  if (playListIndex >= quickStore.getMaxIndex()) {
    playListIndex = 0;
    quickStore.setMaxIndex(playListIndex);
    id = quickStore.getItemByIndex(playListIndex);
  } else {
    playListIndex = playListIndex + 1;
    id = quickStore.getItemByIndex(playListIndex);
  }
  return id;
};

var getTodaysPlayId = function () {
  return quickStore.getItemByIndex(calculateDayIndex());
};

var onEnded = function (event) {
  if (THREE_SIXTY_FIVE_PLAY) {
    var nextPlayId = getNextPlayId();
    event.target.loadVideoById(nextPlayId);
  }
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
    var videoIdAtIndex = quickStore.getItemByIndex(i);
    var videoName = quickStore.getItemById(videoIdAtIndex);
    var element = $('<a/>').attr('id', videoIdAtIndex).html(videoName);
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
    if ( event.which == 13 ) {
      event.preventDefault();
      var videoId = $(event.target).val();
      /** Todo fix up lata
      */
      if (videoId.length === 11){
        player.loadVideoById(videoId);
      }
    }
  });
});











