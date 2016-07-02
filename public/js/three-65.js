/* global YT, $*/

/*
 * @var {boolean} PLAY_TODAY - whither to just repeat today's track automatically
 */
var PLAY_TODAY = true;

/**
 * @var {string} DEFAULT_PLAY_ID - default id if everything goes wrong the player will resort
 */
var DEFAULT_PLAY_ID = 'Ua2loiGHZ38';

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
  } else {
    playlistIndex += 1;
  }

  var item = quickStore.getItemByIndex(playlistIndex);
  if (item) {
    return item.id;
  } else {
    return getTodaysPlayId();
  }
};

/**
 * @function getTodaysPlayId - returns an id base on today's index
 * @return {string} - Youtube media id
 */
var getTodaysPlayId = function () {
  var item = quickStore.getItemByIndex(calculateDayIndex());
  if (item) {
    return item.id;
  }
};

/**
 * @function onEnded - is an event handler the is fired when each track has ended
 */
var onEnded = function (event) {
  playById(getNextPlayId());
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
  playlistIndex += 1;
  playById(getNextPlayId());
};

/**
 * @function playDefaultQueId
 * @return {string} - Youtube media id
 */
var playDefaultQueId = function (erro) {
  if (erro) {
    playById(DEFAULT_PLAY_ID);
  }
  var id = getTodaysPlayId();
  playlistIndex = quickStore.getIndexById(id);
  return id;
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
  /**
* @function playInputId
* @desc - event handler
*/
function playInputId () {
  var videoIdOrUrl = $('#YTVID').val().trim();
  // * 11 is the current length of Youtube videoID
  if (videoIdOrUrl.length === 11) {
    playById(videoIdOrUrl);
  }

  $.ajax({
    type: 'POST',
    url: '/api/add',
    data: JSON.stringify({'mediaurl': videoIdOrUrl}),
    success: function (playlist) {
      renderPlaylist(playlist);
    },
    contentType: 'application/json',
    dataType: 'json'
  });
}

  /**
* delete by id
*
* @name deleteById
* @function
* @param {object} event
*/
function deleteById (id) {
  $.ajax({
    type: 'POST',
    url: '/api/delete',
    data: JSON.stringify({'id': id}),
    success: function (playlist) {
      renderPlaylist(playlist);
    },
    contentType: 'application/json',
    dataType: 'json'
  });
}

$(document).ready(function () {
  // -- set default volume
  var rain = document.getElementById('rain-control');
  rain.volume = 0.2;

  $('#YTVID').keydown(function (event) {
    if (event.which === 13) {
      event.preventDefault();
      playInputId();
    }
  });

  $('body').keydown(function (event) {
    console.log(event.which);
    switch (event.which) {
      // Escape key for closing the modal
      case 27:
        window.location.assign('/#');
        break;
        // letter 'c' changer track
      case 67:
        window.location.assign('/#playlist');
        break;
        // letter 'r' for rain
      case 82:
        rain.volume = 0.0;
// Arrow keys
        break;
      case 37:
      case 38:
        playlistIndex -= 2;
        playById(getNextPlayId());
      // play prev
        break;
      case 39:
      case 40:
        playById(getNextPlayId());
    }

    if (event.which === 13) {
      event.preventDefault();
      playInputId();
    }
  });

  $('#PLAY').click(function () {
    playInputId();
  });
});

function renderPlaylist (playlist) {
  quickStore.updateStore(playlist);
  var $availableList = $('#available-list');
  $availableList.empty();
  var numItems = quickStore.getMaxIndex();
  var todayIndex = calculateDayIndex();
  for (var i = 0; i < numItems; i++) {
    var itemAtIndex = quickStore.getItemByIndex(i);
    var element = $('<div class="list-item"/>');
    element.append($('<img src="' + itemAtIndex.thumbnail.url + '"/>'));
    element.append($('<a id="' + itemAtIndex.id + '">' + (i + 1) + '</a>'));
    element.append($('<p>' + itemAtIndex.title + '</a>'));
    element.append($('<div class="delete closebtn" data-id="' + itemAtIndex.id + '"> &#215;</a>'));

    if (todayIndex === i) {
      element.addClass('today');
    }

    $availableList.append(element);
  }

  $availableList.click(function (event) {
    var videoId;
    if ($(event.target).prop('tagName') === 'A') {
      videoId = $(event.target).attr('id');
      playById(videoId);
    }

    if ($(event.target).hasClass('delete')) {
      videoId = $(event.target).data('id');
      deleteById(videoId);
    }
  });
}

$.get('/api/playlist', function (playlist) {
  renderPlaylist(playlist);
    /**
  * Create script tag to source youtube iframe player
  */

  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
