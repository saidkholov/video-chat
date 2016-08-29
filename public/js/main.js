$(document).ready(function() {
  var connections = [];
  var peer = new Peer([], {host: 'ec2-54-206-23-186.ap-southeast-2.compute.amazonaws.com', port: 3030, path: `/peer` });

  function addMessage(message, type="other") {
    var messageHtml = `<li class="mar-btm">
      <div class="${type=='self' ? 'media-left': 'media-right'}">
        <img src="http://bootdey.com/img/Content/avatar/avatar1.png" class="img-circle img-sm" alt="Profile Picture">
      </div>
      <div class="media-body pad-hor ${type==='other' && 'speech-right'}">
        <div class="speech">
          <p>${message}</p>
          <p class="speech-time">
            <i class="fa fa-clock-o fa-fw"></i> ${new Date()}
          </p>
        </div>
      </div>
    </li>`;
    $('#demo-chat-body ul').append(messageHtml);
  }

  function addVideos(stream) {
    var videos = $('#videos');
    var src = window.URL.createObjectURL(stream);
    var $videoDiv = $(`<div class="col-sm-3" id="${stream.id}"><video controls ></video></div>`);
    var $video = $videoDiv.find('video');
    $video[0].src = src;
    $video[0].play();
    videos.append($videoDiv);
  }

  function removeVideo(id) {
    $('#' + id).remove();
  }

  function callConnectedPeople(stream) {
    $.get('/connected-people')
      .then(function(people) {
        $('#videos').html('');
        people.forEach(function (id) {
          var call = peer.call(id, stream, { metadata: { room } });
          var conn = peer.connect(id, { metadata: { room } });
          connections.push(conn);
          conn.on('open', initClick);
          conn.on('data', addMessage);
          call.on('stream', function(remoteStream) {
            addVideos(remoteStream);
            call.on('close', function() {
              removeVideo(remoteStream.id);
            });
          });
        });
      });
  }

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  navigator.getUserMedia({video: true, audio: true}, function(stream) {
    var video = $('#video')[0];
    video.src = window.URL.createObjectURL(stream);
    video.play();
    callConnectedPeople(stream);

  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
  peer.on('call', function(call) {
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      if (call.metadata.room === room) {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', function(remoteStream) {
          addVideos(remoteStream);
          call.on('close', function() {
            removeVideo(remoteStream.id);
          });
        });
      }
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
  });

  peer.on('connection', function(conn) {
    if (conn.metadata.room === room) {
      connections.push(conn);
      initClick();
      conn.on('data', addMessage);
    }
  });


  $('#share-screen').click(function() {
    var screen_constraints = {
      mandatory: {
        chromeMediaSource: 'desktop',
        maxWidth: 1920,
        maxHeight: 1080,
        minAspectRatio: 1.77
      },
      optional: []
    };
    navigator.getUserMedia({video: screen_constraints, audio: false}, function(stream) {
      callConnectedPeople(stream);
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
  });

  function initClick() {
    $('#send').off('click').on('click', function() {
      var $message = $('#message');
      connections.forEach(function (conn) {
        conn.send($message.val());
      });
      addMessage($message.val(), 'self');
    });
  }

});