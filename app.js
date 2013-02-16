
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
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

var function () {

}

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
var uniqueId = new UniqueId();
var uid = uniqueId.create();

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
    var imgPath = './public/image/' + path,
    data = base64.decodeStringAsUTF8(data);
    socket = socket;

    fs.mkdir(imgPath);
    fs.mkdir('./public/mov');
    executeSync();
    return {
        writeFile :  function() {
            //var execEncode = execEncode;
            for (var i = 0; i < data.length; i++) {
                fs.writeFile('./' + imgPath , data[i] + '.jpeg', function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            gifEncode(path, socket);
        }
    };
};

// 画像から動画へのエンコード
var videoEncode = function (uid, socket) {
    var cmd = 'ffmpeg -i ' + uid + '/%06d.jpg ./mov/' + uid + '.avc';
    execCommand(cmd, socket);
};

// 画像からgifへのエンコード
var gifEncode = function (uid, socket) {
    var cmd = 'convert ./public/images' + uid + '/*.jpeg ./public/images/' + uid + '/' + uid + '.gif';
    exec(cmd, {timeout: 5000},
        function (error, stdout, stderr) {
            console.log('stdout: '+(stdout||'none'));
            console.log('stderr: '+(stderr||'none'));
            var data = [
                {
                    'origin' : 'mov/' + uid + '/' + uid + '.mp4',
                    'gif' : 'images/' + uid + '.gif'
                }
            ];

            redisHandler.setList(uid);
            redisHandler.setData(data);

            executeSync();

            // gif化が終わったので送信
            /*
            data = [{
                'orogin' : originpath,
                'gif' : gifpath
            }];
            */

            socket.emit('fuita', {'data' : data});
        };
    )
};

var executeSync = function() {
    var cmd = 'sync';

    exec(cmd, {timeout: 5000},
        function (error, stdout, stderr) {
            console.log('stdout: '+(stdout||'none'));
            console.log('stderr: '+(stderr||'none'));
            socket.emit();
        };
        )
};

// redisに格納。データ構造は↓みたいな感じ
// list : [id1, id2, id3]
// id : {originPath, gifPath}
// redisのデータを操作する関数
var redisHandler = (function() {
    return {
        setList : function (uid) {
            var value = JSON.stringify(uid);
            client.lpush("uidList", value);
        },
        getList : function () {
            var  list = client.lrange("uidList", 0, 35, function(err, obj) {
                console.log("get list uidList: " + obj);
                return obj;
            });
            return list;
        },
        setData : function(uid, data){
            var key = String(uid),
            value = JSON.stringify(data);
            client.set(key, value);
        },
        getData : function (uid) {
            var data = client.get(uid, function(err, obj) {
                console.log("get  " + uid + obj);
                return obj;
            });
            return JSON.parse(data);
        },
        getDataFromLists : function (list) {
            var data = [];
            for (var i = 0; i < list.length; i++) {
                var value = client.get(list[i], function(err, obj){
                    return obj;
                });
                value = JSON.parse(value);
                data.push(value);
            };
            return data;
        }
    };
})();

/*cmd = 'ffmpeg -i ./mov/CIMG0019.avi -s 320x180 ./gif/%5d.png';

cmd = 'sync'

var execCommand = function (socket, gif) {
    var socket = socket;
    return exec(cmd, {timeout: 5000},
        function (error, stdout, stderr) {
            console.log('stdout: '+(stdout||'none'));
            console.log('stderr: '+(stderr||'none'));
            socket.emit();
        };
        )
};*/

/*hoge = function(socket) {
    return exec(cmd, {timeout: 5000},
        function(error, stdout, stderr) {
            socket.emit('news', { hello: stderr});
            console.log('stdout: '+(stdout||'none'));
            console.log('stderr: '+(stderr||'none'));
            if(error !== null) {
                console.log('exec error: '+error);
            }
        }
        )
};*/

io.sockets.on('connection', function (socket) {

    // dataの受け取り
    // データを受け取ってgif化した後、クライアントからの接続が無い場合はエラー処理して、送信しない。
    // クライアントからの接続の有無を判定する方法調査
    socket.on('aa', function (data) {
        var uid = new UniqueId();

        fileHandler(uid, data, socket).fileWrite();

    });

    // FE側との調整して仕様決定
    // init 最初のコネクト時に36枚分のデータを配列で送信
    /* data = [{'orgin': originpath, 
                    'gif':gifpath}, 
                    {data2},
                    {data3},
                    ・
                    ・
                    ・
                    ]
    */
    var list = redisHandler.getList(),
    data = redisHandler.getDataFromLists(list);

    socket.emit('init', {'data': data});
});