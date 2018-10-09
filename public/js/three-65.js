/* global YT, $ alert */

var DEFAULT_PLAY_ID = 'Ua2loiGHZ38';
var player;
var playlistIndex = 0;
var rainVolume = 0.2;
var repeat = false;

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
function calculateDayIndex () {
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
function getNextPlayId () {
  if (playlistIndex >= quickStore.getMaxIndex() || playlistIndex < 0) {
    playlistIndex = 0;
  } else {
    if (!repeat) {
      playlistIndex += 1;
    }
  }
  var item = quickStore.getItemByIndex(playlistIndex || 0);
  if (item) {
    return item.id;
  }
  return getTodaysPlayId();
};

/**
 * @function getTodaysPlayId - returns an id base on today's index
 * @return {string} - Youtube media id
 */
function getTodaysPlayId () {
  var item = quickStore.getItemByIndex(calculateDayIndex());
  if (item) {
    return item.id;
  }
};

/**
 * @function onEnded - is an event handler the is fired when each track has ended
 */
function onEnded (event) {
  playById(getNextPlayId());
};

/**
 * @function onPlaying - is an event handler the is fired when each track has resumed
 */
function onPlaying (event) {
  console.log('on playing');
};

/**
 * @function onPlayerReady - is an event handler that is fired when the
 * player is fully loading and ready to play
 */

function onPlayerReady (event) {
  event.target.playVideo();
};

/**
 * @function onError - is an event handler that is fired when there is an exception
 */
function onError (event) {
  var itemAtIndex = quickStore.getItemByIndex(playlistIndex);
  deleteById(itemAtIndex.id);
  playById(getNextPlayId());
};

/**
 * @function playDefaultQueId
 * @return {string} - Youtube media id
 */

function playDefaultQueId (erro) {
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

function onPlayerStateChange (event) {
  switch (event.data) {
    case YT.PlayerState.ENDED:
      onEnded(event);
      break;
    case YT.PlayerState.PLAYING:
      onPlaying(event);
      break;
  }
};

/**
 * @function onYouTubeIframeAPIReady is the initialization method to configure the initial
 * state of the player
 */
function onYouTubeIframeAPIReady () {
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
function playById (videoId) {
  player.loadVideoById(videoId);
  playlistIndex = quickStore.getIndexById(videoId);
  var itemAtIndex = quickStore.getItemByIndex(playlistIndex);
  $('.now-playing').html((playlistIndex + 1) + ' ' + itemAtIndex.title);
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

  var comment = $('#COMM').val().trim();

  $.ajax({
    type: 'POST',
    url: '/api/item',
    data: JSON.stringify({ 'mediaurl': videoIdOrUrl, 'comment': comment }),
    success: function (playlist) {
      renderPlaylist(playlist);
    },
    contentType: 'application/json',
    dataType: 'json'
  });
  $('.isertion-form-container').hide();
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
    type: 'DELETE',
    url: '/api/item',
    data: JSON.stringify({ 'id': id }),
    success: function (playlist) {
      renderPlaylist(playlist);
    },
    contentType: 'application/json',
    dataType: 'json'
  });
}

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
    element.append($('<a id="' + itemAtIndex.id + '">&#9658; ' + (i + 1) + '</a>'));
    element.append($('<p>' + itemAtIndex.title + '</a>'));
    element.append($('<div class="delete tinybtn" data-id="' + itemAtIndex.id + '"> &#215;</a>'));
    if (itemAtIndex.comment) {
      element.append($('<div class="info tinybtn" data-comment="' + itemAtIndex.comment + '" data-id="' + itemAtIndex.id + '"> &#9829;</a>'));
    }

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

    if ($(event.target).hasClass('info')) {
      var comment = $(event.target).data('comment');
      alert(comment);
      return null;
    }
  });
}

$(document).ready(function () {
  // -- set default volume
  var rain = document.getElementById('rain-control');
  rain.volume = rainVolume;

  $('#repeat').change(function (event) {
    repeat = !repeat;
  });

  $('#YTVID').keydown(function (event) {
    if (event.which === 13) {
      event.preventDefault();
      playInputId();
    }
  });

  $('#COMM').keydown(function (event) {
    var remianingChars = 140 - $(event.target).val().length;
    $('#char-count').html(remianingChars);
    if (event.which !== 8 && remianingChars <= 0) {
      event.preventDefault();
    }
  });

  $('.isertion-form-container').hide();

  $('#close-add-panel').click(function (event) {
    $('.isertion-form-container').hide();
  });

  $('#add-track').click(function (event) {
    $('.isertion-form-container').show();
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
        if (window.location.hash !== '#playlist') {
          window.location.assign('/#playlist');
        }
        break;
        // letter 'r' for rain
      case 82:
        rainVolume = (rainVolume > 0 ? 0 : 0.2);
        rain.volume = rainVolume;
        break;
      case 37:
      case 38:
      case 75:
        // Arrow keys left and up
        playlistIndex -= 2;
        playById(getNextPlayId());
        // play prev
        break;
      case 39:
      case 40:
      case 74:
        // Arrow keys right and down
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

  $.get('/api/playlist', function (playlist) {
    renderPlaylist(playlist);
    /**
     * Create script tag to source youtube iframe player
     */
    var tag = document.createElement('script');
    tag.src = '//www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
});
