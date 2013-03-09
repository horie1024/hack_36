/*
 * GET results page.
 */

var redis = require('../models/redis.js');

exports.results = function(conf) {
    var conf = conf || {};
    return {
        init : function (req, res) {
            res.render('results', { title : 'this is results'});
        },
        fetchData : function (req, res) {
            // reqが来たらredisから全データを引いて返す
            console.log('data get start');
            // uidListを取得
            redis.getList('uidList', function(dataListObj){
                // 取得したuidの配列をkeyにしてデータを取得
                redis.getDataFromLists(dataListObj, function(dataObj){
                    // resを返す
                    res.send(dataObj);
                });
            });
        }
    };
};