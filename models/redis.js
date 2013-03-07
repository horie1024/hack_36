var redis = require("redis"), 
client = redis.createClient();

var redisHandler = (function() {
    return {
        setList : function (key, uid) {
            var value = JSON.stringify(uid);
            client.lpush(key, value);
        },
        getList : function (key, callback, num) {
            
            if (typeof num == 'undefined') {
                var num = -1;
            } 

            var  list = client.lrange(key, 0, num, function(err, obj) {
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
        },
        getDataFromLists : function (list, callback) {
            client.mget(list, function (err, obj) {
                if (err) {
                    console.log('redis set data err');
                }
                if (typeof obj !== "undefined") {
                    obj = obj.map(function(x) {console.log(x); return JSON.parse(x)});
                }
                callback(obj);
            });
        },
        flushDb : function(callback) {
                client.flushdb(callback);
        }
    };
})();

module.exports = redisHandler;