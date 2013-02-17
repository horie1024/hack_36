var test;
var youtubeURL;
$(document).ready(function(){
  var socket = io.connect('http://www2309uf.sakura.ne.jp/');
  var target = $("#wrapper");
  var overlay = $("#dialog-overlay");
  var dialog = $("#dialog");

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

  function init (data) {
    console.log("inited:");
    console.log(data);
    target.html('');
    for (var i = data.length-1; i >= 0; i--) {
      addImg(data[i]);
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
    addMovie(data[0]);
  }

  function removeFirstImage() {
    //画像がいっぱいならば最初に投稿された動画を削除
    if($(".pictWrap").size() >= 36) {
      console.log("remove picture");
      $(".pictWrap:last").remove();
    }
  }
  function addMovie (data) {
    console.log(data);
    var id = "#fuita_" + data.uid;
    console.log("movie:" + id);
    $(id).append('<div class="videoWrap"  id="origin_'+ data.uid 
      + '" style="display:none"><a href="'+ data.url 
      +'" target="_blank" ></a></div>');
    console.log(data);
  }

   //gifをDOMに追加する
  function addImg (img) {
    var picture = $('<div class="pictWrap" id="fuita_'
      + img.uid +'"><img src="'
      + img.gif +'" width="306" height="172">'
      + '</div>');
    target.prepend(picture);
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
