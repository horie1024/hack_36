$(document).ready(function(){
  //var socket = io.connect('http://localhost');
  var target = $("#wrapper");

  //stub
  var data = [{"id":"1", "origin":"http://yahoo.co.jp", "gif":"http://livedoor.blogimg.jp/vsokuvip/imgs/b/1/b122bfe5.gif" }, {"id":"2", "origin":"http://yahoo.co.jp", "gif":"http://livedoor.blogimg.jp/vsokuvip/imgs/1/c/1cc43e81.gif" }]

//  socket.on('init', function (data) {
//    fuita(init);
//  }); 
//
//  socket.on('fuita', function (data) {
//    fuita(data);
//  });  
//
//  socket.on('video_ok', function(data) {
//    addMovie(data);
//  });

  $("#init").click(function () {
      init(data);
  });
  $("#fuita").click(function () {
      fuita(data);
  });
  $("#video_ok").click(function () {
      addMovie(data[0]);
  });

  function init (data) {
    console.log("inited:" + data);
    target.html('');
    for (var i = data.length - 1; i >= 0; i--) {
      addImg(data[i]);
    };
  }                 
    
  function fuita (data) {
    showDialog();
    console.log("fuitad:" + data);
    addImg(data[0]);
  }

  function addMovie (data) {
    var id = "#fuita_" + data.id;
    console.log("movie:" + id);
    $(id).append('<video　src＝”'+ data.origin +' style="display:none"></video>');
  }

   //gifをDOMに追加する
   function addImg (img) {
      console.log(img);
      var picture = $('<div class="pictWrap" id="fuita_'+ img.id +'"><div class="pict"> <img src="'+ img.gif +'" width="236" height="134"> </div>');
      target.prepend(picture);
      picture.click(function(){
         console.log(img.gif);
      });
     picture.filter(".pictWrap").hoverpulse();
   }

   //吹いたダイアログ表示
   function showDialog() {
     console.log("showDialog");
     var overlay = $("#dialog-overlay");
     var dialog = $("#dialog");

     overlay.show();
     dialog.show();

     setTimeout( function() {
       overlay.hide();
       dialog.hide();
     }, 1000);
   } 
});