$(document).ready(function(){
  var socket = io.connect('http://www2309uf.sakura.ne.jp/');
  var target = $("#wrapper");
  var overlay = $("#dialog-overlay");
  var dialog = $("#dialog");

  socket.on('init', function (data) {
    init(data.data);
  }); 

  socket.on('fuita', function (data) {
    fuita(data.data);
  });  

  socket.on('video_ok', function(data) {
    addMovie(data.data) ;
  });

  $("#init").click(function () {
    init(data);
//    $(".pictWrap img").hoverpulse();
//    $(".pictWrap pict").hoverpulse();
  });
  $("#fuita").click(function () {
    fuita(data);
 //   $(".pictWrap img").hoverpulse();
 //   $(".pictWrap pict").hoverpulse();
  });
  $("#video_ok").click(function () {
      addMovie(data);
  });

  function init (data) {
    console.log("inited:");
    console.log(data);
    target.html('');
    for (var i = data.length-1; i >= 0; i--) {
      console.log(data[i]);
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

  function removeFirstImage() {
    //画像がいっぱいならば最初に投稿された動画を削除
    if($(".pictWrap").size() >= 36) {
      console.log("remove picture");
      $(".pictWrap:last").remove();
    }
  }
  function addMovie (data) {
    console.log("video_ok:");
    console.log(data);
    var id = "#fuita_" + data.uid;
    console.log("movie:" + id);
    $(id).append('<div class="videoWrap"  id="origin_'+ data.uid 
      + '" style="display:none"><video src="'+ data.origin 
      +'" loop preload="auto" autoplay="true"></video></div>');
  }

   //gifをDOMに追加する
  function addImg (img) {
    console.log(img);
    var picture = $('<div class="pictWrap" id="fuita_'+ img.uid +'"><div class="pict"> <img src="'+ img.gif +'" width="236" height="134"> </div>');
    target.prepend(picture);
    picture.click(function(){
      console.log(img.gif);
      //クリックで元動画再生
      var video_id = "#origin_" + img.uid;
      console.log(video_id);
      if ($(video_id).size() > 0) {
        $(video_id).show();
        overlay.show();
        overlay.click(function () {
          $(video_id).hide();
          overlay.hide();
        });
      }
    });
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