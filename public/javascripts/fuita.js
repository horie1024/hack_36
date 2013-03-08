var test;
var youtubeURL;
$(document).ready(function(){
  var server = 'http://www2309uf.sakura.ne.jp/';
  var socket = io.connect(server);
  var target = $("#wrapper");
  var overlay = $("#dialog-overlay");
  var dialog = $("#dialog");
  var video_dialog = $("#video_dialog");

  socket.on('init', function (data) {
    init(data.data);
    //$(".pictWrap img").hoverpulse();
    test = data.data;
  }); 

  socket.on('fuita', function (data) {
    fuita(data.data);
    //$(".pictWrap img").hoverpulse({zIndexActive:10});
  });  

  socket.on('post_facebook', function (data) {
    console.log('post facebook start.');
    FUITA.postFacebook(data.url);
  });

  socket.on('video_ok', function(data) {
    video_ok(data.data);
  });

  $("#init").click(function () {
    init(data);
//    $(".pictWrap img").hoverpulse();
//    $(".pictWrap pict").hoverpulse();
  });
  $("#fuita").click(function () {
    fuita(test);
 //   $(".pictWrap img").hoverpulse();
 //   $(".pictWrap pict").hoverpulse();
  });
  $("#video_ok").click(function () {
    //video_ok(test);
  });

  overlay.click(function() {
    overlay.hide();
    dialog.hide();
    video_dialog.hide();
  });

  function init (data) {
    console.log("inited:");
    console.log(data);
    target.html('');
    for (var i = data.length-1; i >= 0; i--) {
      var picture = addImg(data[i]);
      addMovie(data[i], picture);
    };
  }                 

  function fuita (data) {
    console.log("fuitad:");
    console.log(data);
    showDialog();
    removeFirstImage();
    addImg(data[0]);
  }

  function video_ok (data) {
    console.log("video_ok:");
    var id = '#fuita_' + data.uid;
    addMovie(data[0], $(id));
  }

  function removeFirstImage() {
    //画像がいっぱいならば最初に投稿された動画を削除
    if($(".pictWrap").size() >= 36) {
      console.log("remove picture");
      $(".pictWrap:last").remove();
    }
  }

  //YouTube動画を追加する
  function addMovie (data, picture) {
    picture.click(function (){
      video_dialog.children("iframe").attr('src', data.origin);
      overlay.show();
      video_dialog.show();
    });
  }

   //gifをDOMに追加する
  function addImg (img) {
    var picture = $('<div class="pictWrap" id="fuita_'
      + img.uid +'"><img src="'
      + server + img.gif +'" width="306" height="172">'
      + '</div>');
    target.prepend(picture);
    return picture;
  }

  //吹いたダイアログ表示
  function showDialog() {
    console.log("showDialog");

    overlay.show();
    dialog.show();

    setTimeout( function() {
      overlay.hide();
      dialog.hide();
    }, 2000);
  } 
});
