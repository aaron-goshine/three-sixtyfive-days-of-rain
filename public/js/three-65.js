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
      this.dataHash[currentItem.id + '_idx'] = i;
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
  },
  getIndexById: function (videoId) {
    return this.dataHash[videoId + '_idx'];
  }
};

var calculateDayIndex = function () {
  var currentDate = new Date();
  var startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  var timeOffSet = currentDate.getTime() - startOfYear.getTime();
  var dayOfYear = Math.ceil(timeOffSet / 86400000);
  return dayOfYear > 0 ? dayOfYear - 1 : dayOfYear;
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
  playById(getNextPlayId());
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
    var id = getTodaysPlayId();
    playListIndex = quickStore.getIndexById(id);
    return id;
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
    width: '360',
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

var playById = function (videoId) {
  player.loadVideoById(videoId);
  playListIndex = quickStore.getIndexById(videoId);
  $('.item-outline').removeClass('item-outline');
  $('#' + videoId).parent().addClass('item-outline');
};

$(document).ready(function () {
  var $availableList = $('#available-list');
  var numItems = quickStore.getMaxIndex();
  var todayIndex = calculateDayIndex();
  for (var i = 0; i < numItems; i++) {
    var itemAtIndex = quickStore.getItemByIndex(i);
    var element = $('<div class="list-item"/>')
    .html(itemAtIndex.name)
    .append($('<a id="' +  itemAtIndex.id + '">' + (i + 1) + '</a>'));

    if (todayIndex === i) {
      element.addClass('today');
    }

    $availableList.append(element);
  }
  $availableList.click(function (event) {
    if ($(event.target).prop('tagName') === 'A') {
      var videoId = $(event.target).attr('id');
      playById(videoId);
    }
  });

  $('#YTVID').keydown(function (event) {
    if (event.which === 13) {
      event.preventDefault();
      var videoId = $(event.target).val();
      // * 11 is the current length of Youtube videoID
      if (videoId.length === 11) {
        playById(videoId);
      }
    }
  });
});
/**
 * --- @global @param playlistRecommendation is loaded in as javaScript file
 * containing an array for youtube ids
 */

quickStore.updateStore(playlistRecommendation);
