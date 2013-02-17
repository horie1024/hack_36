
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , youtube = require('youtube')
  , redis = require("redis")
  , client = redis.createClient();

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

app.get('/', routes.index);
app.get('/users', user.list);

var exec = require('child_process').exec, 
cmd = '';

//uniqie id作成
var UniqueId = function() {};

UniqueId.prototype = {
    create: function() {
        var randam = Math.floor(Math.random() * 1000),
        date = new Date(),
        time = date.getTime();
        return randam + '_' + time.toString();
    }
};

// ファイル操作
// 受け取った画像を保存
// フレームごとの画像を受け取って、一度ファイルに保存。ディレクトリを作る感じ？
// 保存したファイルを動画と
// 元ファイル名の取得どうするか？
// 画像の保存先どうするか？
var fileHandler = function (path, data, socket) {
    console.log('Start write file');
    var imgPath = './public/images/' + path;
    socket = socket;

    console.log('imgPath : ' + imgPath);

    fs.mkdir(imgPath);
    fs.mkdir('./public/mov/' + path);
    return {
        writeFile :  function() {
            //var execEncode = execEncode;
            for (var i = 0; i < data.length; i++) {
                var binary = new Buffer(data[i], 'base64');
                //console.log('data : ' + data[i]);
                fs.writeFileSync(imgPath + '/' + ("0" + i).slice(-2) + '.jpeg', binary, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            console.log('start create gif');
            setTimeout(function() { gifEncode(path, socket)}, 500);
            //gifEncode(path, socket);
            console.log('start create video');
            videoEncode(path, socket);
        }
    };
};

// 画像から動画へのエンコード
var videoEncode = function (uid, socket) {
    console.log('start videoEncode');
    //var cmd = 'ffmpeg -i ' + './public/images/' + uid + '/%d.jpeg ./public/mov/' + uid + '/' + uid + '.avi';
    var cmd = 'ffmpeg -r 10 -i ' + './public/images/' + uid + '/%02d.jpeg ./public/mov/' + uid + '/' + uid + '.mp4';
    exec(cmd, {timeout: 5000},
        function (error, stdout, stderr) {
            console.log('stdout: '+(stdout||'none'));
            console.log('stderr: '+(stderr||'none'));

            var data = [
                {
                    'video' : 'mov/' + uid + '/' + uid + '.mp4',
                    'uid' : uid
                }
            ];
            socket.emit('video_ok', {'data':data});
            
            youtube
            .createUpload('/public/mov/' + uid + '/' + uid + '.mp4')
            .user('kabutomushi.hd')
            .source('fuita')
            .password('kabutomushi')
            .key('AI39si7VFvglYKc-6oY1jHZSO9lLhPm44cGwMNC19b5_0ABP2enhCZJ36vjwDR7W0l5IsM5YwA6bfoUsQdwC9EHVVg85H2jDIA')
            .title('FUITA!')
            .description('This is fuita.')
            .category('Education')
            .upload(function(err, res){
              if (err) throw err;
              console.log('done');
              console.log(res.id);
              console.log(res.url);
              console.log(res.embed());
              console.log(res.embed(320, 320));
              console.log(require('util').inspect(res, false, 15, true));
          });
            /*
            var cmd = 'ffmpeg -i ./public/mov/' + uid + '/' + uid + '.avi -f mp4 ./public/mov/' + uid + '/' + uid +'.mp4';
            exec(cmd, {timeout: 5000},
                function (error, stdout, stderr) {
                    console.log('stdout: '+(stdout||'none'));
                    console.log('stderr: '+(stderr||'none'));
                    var data = [
                        {
                            'video' : 'mov/' + uid + '/' + uid + '.mp4',
                            'uid' : uid
                        }
                    ];
                    socket.emit('video_ok', {'data':data});
                }
            )
            */
        }
    )
};

// 画像からgifへのエンコード
var gifEncode = function (uid, socket) {
    var cmd = 'convert ./public/images/' + uid + '/*.jpeg ./public/images/' + uid + '/' + uid + '.gif';

    exec(cmd, {timeout: 5000},
        function (error, stdout, stderr) {
            console.log('stdout: '+(stdout||'none'));
            console.log('stderr: '+(stderr||'none'));
            var data = [
                {
                    'origin' : 'mov/' + uid + '/' + uid + '.mp4',
                    'gif' : 'images/' + uid + '/' + uid + '.gif',
                    'uid' : uid
                }
            ];

            console.log('start redis');
            redisHandler.setList('uidList', uid);
            redisHandler.setData(uid, data);
            console.log('end redis');

            // gif化が終わったので送信
            var fuita = [
                {
                    'gif' : 'images/' + uid + '/' + uid + '.gif',
                    'uid' : uid
                }
            ];
            console.log('send data with socket.io');
            socket.emit('fuita', {'data' : fuita});
        }
    )
};

// redisに格納。データ構造は↓みたいな感じ
// list : [id1, id2, id3]
// id : {originPath, gifPath}
// redisのデータを操作する関数
var redisHandler = (function() {
    return {
        setList : function (key, uid) {
            var value = JSON.stringify(uid);
            client.lpush(key, value);
        },
        getList : function (key, callback) {
            var  list = client.lrange(key, 0, 35, function(err, obj) {
                if (err) {
                    console.log('redis set data err');
                }
                console.log("get list uidList: " + obj);
                obj = obj.map(function(x) {return JSON.parse(x);});
                callback(obj);
            });
            return list;
        },
        setData : function(key, data){
            var value = JSON.stringify(data);
            client.set(key, value,  function (err, obj) {
                if (err) {
                    console.log('redis set data err');
                }
                console.log('redis set data ok.');
            });
        },
        getData : function (uid, callback) {
            client.get(uid, function(err, obj) {
                if (err) {
                    console.log('redis set data err');
                }
                obj = JSON.parse(obj);
                console.log("get  " + uid + obj);
                callback(obj);
            });
            return JSON.parse(data);
        },
        getDataFromLists : function (list, callback) {
            client.mget(list, function (err, obj) {
                if (err) {
                    console.log('redis set data err');
                }
                callback(obj);
            });
        }
    };
})();

io.sockets.on('connection', function (socket) {

    // dataの受け取り
    // データを受け取ってgif化した後、クライアントからの接続が無い場合はエラー処理して、送信しない。
    // クライアントからの接続の有無を判定する方法調査
    socket.on('fuita', function (data) {
        console.log('connect fuita');
        console.log(data);
        
        var uniqueId = new UniqueId();
        var uid = uniqueId.create();
        console.log('create uid = ' + uid);

        fileHandler(uid, data.frames, socket).writeFile();

    });

    // FE側との調整して仕様決定
    // init 最初のコネクト時に36枚分のデータを配列で送信
    /* data = [{'orgin': originpath, 
                    'gif':gifpath}, 
                    {data2},
                    {data3},
                    ・
                    ]
    */
    console.log('init start.');
    redisHandler.getList('uidList', function(dataListObj){
        redisHandler.getDataFromLists(dataListObj, function(dataObj){
            console.log('send data to FE');
            socket.emit('init', {'data': dataObj});
        });
    });
});
