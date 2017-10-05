var Acti = require('../model/activity').Acti;
var Actm = require('../model/activity').Actm;
var eventproxy = require('eventproxy');
var reply = require('../lib/reply');
const logger = require('../lib/logger').logger('file');
const moment = require('moment');


// post /activity
exports.add = function(req, res, next) {
    var date = req.body.date;   //活动日期    年-月-日
    var start = req.body.start; //开始时间    时：分
    var end = req.body.end;     //结束时间    时：分
    var addr = req.body.addr;   //活动地址    
    var comment = req.body.comment; //备注    
    var corpId = req.body.corpId;   //社团ID  foreign key

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg.str
        };

        reply.reply(req, res, retStr);
    });


    if (typeof(corpId) == 'undefined') {
        ep.emit('err', {ret: 8004, str: '不能为空'});
        return;
    }

    var newActi = {
        date: date,
        start: start,
        end: end,
        addr: addr,
        comment: comment,
        corpId: corpId
    };

    (async () => {
        var acti = await Acti.create(newActi);

        if (!acti) {
            ep.emit('err', {ret: 8005, str: '数据库错误'});
            return;
        }
        else {
            var retStr = {
                ret: 0,
                id: acti.id
            };
            reply.reply(req, res, retStr);
        }

    }) ()
   
};

// GET /activity 
exports.get = function(req, res, next) {
    var list = [];
    var filter = JSON.parse(req.query.filter);

    var ep = new eventproxy();

    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };
        reply.reply(req, res, retStr);
    });

    (async () => {
        var actis = await Acti.query(filter);

        if (actis.length > 0) {
            for (var i =0; i < actis.length; i++) {
                list.push(actis[i]);
            }
        }

        var retStr = {
            ret: 0,
            data: list
        };

        reply.reply(req, res, retStr);

    }) ()
};

// GET /activity/:id
exports.getone = function(req, res, next) {
    var id = req.params.id;
    var ep = new eventproxy();

    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        reply.reply(req, res, retStr);
    });

    (async () => {
        var acti = await Acti.query({id: id});

        var retStr = {
            ret: 0,
            data: acti
        };

        reply.reply(req, res, retStr);
    }) ()
};

// PUT /activity/:id
exports.update = function(req, res, next) {
    var id = req.params.id;
    var date = req.body.date;
    var start = req.body.start;
    var end = req.body.end;
    var addr = req.body.addr;
    var comment = req.body.comment;

    var ep = new eventproxy();

    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg.str
        };

        reply.reply(req, res, retStr);
    });


    (async () => {
        var acti = await Acti.query({id: id});

        if (!acti) {
            ep.emit('err', {ret:8005, str:'小区信息错误'});
            return;
        }
        
        var newActi = {
            date: date,
            start: start,
            end: end,
            addr: addr,
            comment: comment,
        };

        Acti.update(acti, newActi);

        var retStr = {
            ret: 0,
        };

        reply.reply(req, res, retStr);

    }) ()
   
};

// DELETE /activity/:id
exports.delete = function(req, res, next) {
    var id = req.params.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg.str
        };

        reply.reply(req, res, retStr);
    });

    (async () => {
        var acti = await Acti.query({id: id});
        if (!acti) {
            ep.emit('err', {ret:8005, str:'小区信息错误'});
            return;
        }

        Acti.delete(acti);

        var retStr = {
            ret: 0
        };

        reply.reply(req, res, retStr);

    }) ()
};

// POST /activity/join
exports.join = function(req, res, next) {
}
