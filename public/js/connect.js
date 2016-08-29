$(document).ready(function() {


  var peer = new Peer('idGosha', {host: 'localhost', port: 3030, path: '/peer'});
  // var conn = peer.connect('idGosha2');
  // conn.on('open', function(){
  //   conn.send('hi!');
  // });
  //
  // peer.on('connection', function(conn) {
  //   conn.on('data', function(data){
  //     console.log(data);
  //   });
  // });

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  peer.on('call', function(call) {
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
      var video = $('#video')[0];

      video.src = window.URL.createObjectURL(stream);
      video.play();
      call.answer(stream); // Answer the call with an A/V stream.
      call.on('stream', function(remoteStream) {
        var video2 = $('#video2')[0];
        video2.src = window.URL.createObjectURL(remoteStream);
        video2.play();
      });
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
  });

});