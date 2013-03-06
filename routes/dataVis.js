/*
 * GET results page.
 */

var redis = require('../models/redis.js');

exports.results = function(data) {
    var data = data;
    return {
        init : function (req, res) {
            res.render('results', { title : 'this is results'});
        },
        fetchData : function (req, res) {
            console.log('data get start');
            redis.getList('uidList', function(dataListObj){
                console.log('getDataFromList');
                console.log(dataListObj);
                redis.getDataFromLists(dataListObj, function(dataObj){
                    console.log('send data to results');
                    res.send(dataObj);
                });
            });
        }
    };
};