var Corp = require('../model/corporation').Corp;
var Corpm = require('../model/corporation').Corpm;
var eventproxy = require('eventproxy');
var reply = require('../lib/reply');
const logger = require('../lib/logger').logger('file');
const moment = require('moment');


// post /corporation
exports.add = function(req, res, next) {
    var name = req.body.name;
    var actAddr1 = req.body.actAddr1;
    var actAddr2 = req.body.actAddr2;
    var actAddr3 = req.body.actAddr3;
    var mgmtUid = req.session.user.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg.str
        };

        reply.reply(req, res, retStr);
    });


    if ([name].some(function(item) {return item === '';})) {
        ep.emit('err', {ret: 8004, str: '名称不能为空'});
        return;
    }

    if (typeof(actAddr1) == 'undefined') {
        actAddr1 = "";
    }
    if (typeof(actAddr2) == 'undefined') {
        actAddr2 = "";
    }
    if (typeof(actAddr3) == 'undefined') {
        actAddr3 = "";
    }

    var newCorp = {
        name: name,
        actAddr1: actAddr1,
        actAddr2: actAddr2,
        actAddr3: actAddr3,
        mgmtUid: mgmtUid
    };

    (async () => {
        var corp = await Corp.create(newCorp);

        if (!corp) {
            ep.emit('err', {ret: 8005, str: '数据库错误'});
            return;
        }
        else {
            var retStr = {
                ret: 0,
                id: corp.id
            };
            reply.reply(req, res, retStr);
        }

    }) ()
   
};

// GET /corporation 
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
        var corps = await Corp.query(filter);

        if (corps.length > 0) {
            for (var i =0; i < corps.length; i++) {
                list.push(corps[i]);
            }
        }

        var retStr = {
            ret: 0,
            data: list
        };

        reply.reply(req, res, retStr);

    }) ()
};

// GET /corporation/:id
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
        var corp = await Corp.query({id: id});

        var retStr = {
            ret: 0,
            data: corp
        };

        reply.reply(req, res, retStr);
    }) ()
};

// PUT /corporation/:id
exports.update = function(req, res, next) {
    var id = req.params.id;
    var name = req.body.name;
    var actAddr1 = req.body.actAddr1;
    var actAddr2 = req.body.actAddr2;
    var actAddr3 = req.body.actAddr3;

    var ep = new eventproxy();

    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg.str
        };

        reply.reply(req, res, retStr);
    });

    if (typeof(actAddr1) == 'undefined') {
        actAddr1 = "";
    }
    if (typeof(actAddr2) == 'undefined') {
        actAddr2 = "";
    }
    if (typeof(actAddr3) == 'undefined') {
        actAddr3 = "";
    }

    (async () => {
        var corp = await Corp.query({id: id});

        if (!corp) {
            ep.emit('err', {ret:8005, str:'小区信息错误'});
            return;
        }
        
        var newCorp = {
            name: name,
            actAddr1: actAddr1,
            actAddr2: actAddr2,
            actAddr3: actAddr3
        };

        Corp.update(corp, newCorp);

        var retStr = {
            ret: 0,
        };

        reply.reply(req, res, retStr);

    }) ()
   
};

// DELETE /corporation/:id
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
        var corp = await Corp.query({id: id});
        if (!corp) {
            ep.emit('err', {ret:8005, str:'小区信息错误'});
            return;
        }

        Corp.delete(corp);

        var retStr = {
            ret: 0
        };

        reply.reply(req, res, retStr);

    }) ()
};

// POST /corporation/join
exports.join = function(req, res, next) {
}

// POST /corporation/leave
exports.leave = function(req, res, next) {
}
