/* eslint YT $ playlistRecommendation */

/*
 * @var {boolean} THREE_SIXTY_FIVE_PLAY - will determined whither to continuous
 *  play all items in the list
 */
var THREE_SIXTY_FIVE_PLAY = true;

/*
 * @var {boolean} PLAY_TODAY - whither to just repeat today's track automatically
 */
var PLAY_TODAY = true;

/**
 * @var {string} DEFAULT_PLAY_ID - default id if everything goes wrong the player will resort
 */
var DEFAULT_PLAY_ID = 'kbrhuUFjCII';

/**
 * @var {object} player - reference to the current instant of the Youtube iframe player
 */
var player;

/**
 * @var {number} playlistIndex - The current index of the 365 play list
 */
var playlistIndex = 0;

/**
 * @var quickStore - is an interface to the current playlist
 */
var quickStore = {
  data: [],
  dataHash: {},
  /**
   * @method  updateStore
   * @param {array} data - Array containing objects @like `{id : ...., name: ......}`
   */
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

/**
 * @function calculateDayIndex - calculate the number of the current day of the current year
 * as a zero index value
 * @return {number}
 */
var calculateDayIndex = function () {
  var currentDate = new Date();
  var startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  var timeOffSet = currentDate.getTime() - startOfYear.getTime();
  var dayOfYear = Math.ceil(timeOffSet / 86400000);
  return dayOfYear > 0 ? dayOfYear - 1 : dayOfYear;
};

/**
 * @function getNextPlayId - returns the next Id in the playlist
 * @return {string} - Youtube media id
 */
var getNextPlayId = function () {
  if (playlistIndex >= quickStore.getMaxIndex() || playlistIndex < 0) {
    playlistIndex = 0;
  }
  return quickStore.getItemByIndex(playlistIndex).id;
};

/**
 * @function getTodaysPlayId - returns an id base on today's index
 * @return {string} - Youtube media id
 */
var getTodaysPlayId = function () {
  return quickStore.getItemByIndex(calculateDayIndex()).id;
};

/**
 * @function onEnded - is an event handler the is fired when each track has ended
 */
var onEnded = function (event) {
  console.log('on ended');
  playById(getNextPlayId());
  playlistIndex += 1;
};

/**
 * @function onPlaying - is an event handler the is fired when each track has resumed
 */
var onPlaying = function (event) {
  console.log('on playing');
};

/**
 * @function onPaused - is an event handler the is fired when each track is paused
 */

var onPaused = function (event) {
  console.log('on paused');
};

/**
 * @function stopVideo - is a wrapper to the current player.stopVideo()
 */
var stopVideo = function () {
  player.stopVideo();
};

/**
 * @function onPlayerReady - is an event handler that is fired when the
 * player is fully loading and ready to play
 */
var onPlayerReady = function (event) {
  event.target.playVideo();
};

/**
 * @function onError - is an event handler that is fired when there is an exception
 */
var onError = function (event) {
  playDefaultQueId(event);
};

/**
 * @function playDefaultQueId
 * @return {string} - Youtube media id
 */
var playDefaultQueId = function () {
  if (PLAY_TODAY) {
    var id = getTodaysPlayId();
    playlistIndex = quickStore.getIndexById(id);
    return id;
  }
  return DEFAULT_PLAY_ID;
};

/**
 * @function onPlayerStateChange - is an primary event delegate that is will trigger
 * methods corresponding to specific event handles
 */

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

/**
 * @function onYouTubeIframeAPIReady is the initialization method to configure the initial
 * state of the player
 */
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

/**
 * @function playById  - this function plays and item via and id,
 * update the current playlist index and update the display
 * @param {string} playById - Youtube media id
 *
 */
var playById = function (videoId) {
  player.loadVideoById(videoId);
  playlistIndex = quickStore.getIndexById(videoId);
  $('.item-outline').removeClass('item-outline');
  $('#' + videoId).parent().addClass('item-outline');
};

$(document).ready(function () {
    /**
   * @function playInputId
   * @desc - event handler
   */
  function playInputId () {
    var videoId = $('#YTVID').val().trim();
    // * 11 is the current length of Youtube videoID
    if (videoId.length >= 11) {
      playById(videoId);
    }
  }
  /**
   * event handle for the choose a track modal view
   */
  $('#YTVID').keydown(function (event) {
    if (event.which === 13) {
      event.preventDefault();
      playInputId();
    }
  });

  $('#PLAY').click(function () {
    playInputId();
  });
});

$.get('/js/playlist.json', function (playlist) {
  debugger;
  quickStore.updateStore(playlist);
  var $availableList = $('#available-list');
  var numItems = quickStore.getMaxIndex();
  var todayIndex = calculateDayIndex();
  for (var i = 0; i < numItems; i++) {
    var itemAtIndex = quickStore.getItemByIndex(i);
    var element = $('<div class="list-item"/>')
      .append($('<a id="' + itemAtIndex.id + '">' + (i + 1) + '</a>'))
      .append(itemAtIndex.name);

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

  /**
  * Create script tag to source youtube iframe player
  */
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

})
//-- set default volume
var rain = document.getElementById("rain-control");
rain.volume = 0.2;
