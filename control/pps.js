
var Pps = require('../model/pps');
var eventproxy = require('eventproxy');
var User = require('../model/user');
var validator = require('validator');
const moment = require('moment');

exports.message_handle = function(req, res, next) {
    console.log('pps_req='+JSON.stringify(req.body));
    var msgType = req.body.type;

    if ('MSG_T_MGMT_QUERY_PPS' == msgType) {
        queryPps(req, res, next);
    }
    else if ('MSG_T_MGMT_NEW_PPS' == msgType) {
        addPps(req, res, next);
    }
    else if ('MSG_T_MGMT_UPDATE_PPS' == msgType) {
        updatePps(req, res, next);
    }
    else if ('MSG_T_MGMT_DEL_PPS' == msgType) {
        delPps(req, res, next);
    }
    else {
        next();
    }
};


function addPps(req, res, next) {

    var name = req.body.name;
    var phone = req.body.phone;
    var contacts = req.body.contacts;
    var email = req.body.email;
    //var parkNum = req.body.parkNum;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            type: req.body.type,
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    if ([name, phone].some(function(item) {return item === '';})) {
        ep.emit('err', '信息不完整');
        return;
    }

    if (!validator.isNumeric(phone) || !validator.isLength(phone, 11)) {
        ep.emit('prop_err', '手机号码不合法');
        return;
    }

    (async() => {
        var user_id;

        var user = await User.getUserByPhone(phone);
        if (user) {
            user_id = user.id;
        }
        else {
            var newUser = {
                login_name: contacts,
                phone_num: phone,
                email: email,
                role: 'changshang'
            };

            var newuser = await User.newAndSave(newUser);
            user_id = newuser.id;
        }

        var newPps = {
            name: name,
            //parkNum: parkNum,
            user_id: user_id,
            contacts: contacts,
            phone: phone,
            email: email
        };

        var pps = await Pps.newAndSave(newPps);
        if (!pps) {
            ep.emit('err', '数据库错误');
            return;
        }

        var retStr = {
            type: req.body.type,
            ret: 0,
            id: pps.id
        };

        res.send(JSON.stringify(retStr));

    }) ()

}

function queryPps(req, res, next) {

    var name = req.body.name;
    var list = [];

    (async () => {
        var ppss;

        if (typeof(name) == "undefined") {
            ppss = await Pps.queryAllPps();
        } else {
            ppss = await Pps.queryPps(name);
        }

        if (ppss.length > 0) {
            for (var i in ppss) {
                var user = await User.getUserById(ppss[i].user_id);
                var regdate = ppss[i].createdAt;

                if (user) {
                    var info = {
                        id: ppss[i].id,
                        name: ppss[i].name,
                        parkNum: ppss[i].parkNum,
                        regDate: moment(regdate).format('MM-DD HH:mm'),
                        phone: user.phone_num,
                        contacts: user.login_name,
                        email: user.email
                    };
                }
                else {
                    var info = {
                        id: ppss[i].id,
                        parkNum: ppss[i].parkNum,
                        phone: ppss[i].phone,
                        contacts: ppss[i].contacts,
                        email: ppss[i].email
                    };
                }

                list.push(info);
            }
        }

        var retStr = {
            type: req.body.type,
            ret: 0,
            data: list
        };

        res.send(JSON.stringify(retStr));
    }) ()
}

function updatePps(req, res, next) {
    
    var id = req.body.id;
    var phone = req.body.phone;
    var uid;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            type: req.body.type,
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async() => {
        var pps = await Pps.getPpsById(id);
        if (!pps) {
            ep.emit('err', '设备厂商id错误');
            return;
        }
        
        uid = pps.user_id;
        var user = await User.getUserById(uid);

        if (user.phone_num != phone) {
            var s_user = await User.getUserByPhone(phone);
            if (s_user) {
                uid = s_user.id;
            } 
            else {
                var newUser = {
                    phone_num: phone,
                    login_name: req.body.contacts,
                    email: req.body.email,
                    role: 'changshang'
                };

                var newuser = await User.newAndSave(newUser);
                uid = newuser.id;
            }
        }

        var newPps = {
            name: req.body.name,
            parkNum: req.body.parkNum,
            user_id: uid,
            contacts: req.body.contacts,
            phone: req.body.phone,
            email: req.body.email
        };

        Pps.updatePps(pps, newPps);

        var retStr = {
            type: req.body.type,
            ret: 0
        };

        res.send(JSON.stringify(retStr));
    }) ()
}

function delPps(req, res, next) {

    var id = req.body.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            type: req.body.type,
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });


    (async() => {
        var pps = await Pps.getPpsById(id);
        if (!pps) {
            ep.emit('err', '设备厂商不存在');
            return;
        }

        Pps.deletePps(pps);

        var retStr = {
            type: req.body.type,
            ret: 0
        };

        res.send(JSON.stringify(retStr));
    }) ()
}

exports.add = function(req, res, next) {
    var name = req.body.name;
    var phone = req.body.phone;
    var contacts = req.body.contacts;
    var email = req.body.email;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    if ([name, phone].some(function(item) {return item === '';})) {
        ep.emit('err', '信息不完整');
        return;
    }

    if (!validator.isNumeric(phone) || !validator.isLength(phone, 11)) {
        ep.emit('prop_err', '手机号码不合法');
        return;
    }

    (async() => {
        var newPps = {
            name: name,
            contacts: contacts,
            phone: phone,
            email: email
        };

        var pps = await Pps.newAndSave(newPps);
        if (!pps) {
            ep.emit('err', '数据库错误');
            return;
        }

        var retStr = {
            ret: 0,
            id: pps.id
        };

        res.send(JSON.stringify(retStr));

    }) ()
   
};

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

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var ppss;

        if (typeof(filter.name) != 'undefined') {
            ppss = await Pps.queryPps(filter.name);
        }
        else {
            ppss = await Pps.query(filter);
        }

        //ppss = await Pps.queryPps(filter);

        if (ppss.length > 0) {
            for (var i =0; i < ppss.length; i++) {
                var info = {
                    name: ppss[i].name,
                    contacts: ppss[i].contacts,
                    phone: ppss[i].phone,
                    email: ppss[i].email,
                    parkNum: ppss[i].parkNum,
                    createdAt: moment(ppss[i].createdAt).format('YYYY-MM-DD HH:mm')
                };

                list.push(info);
            }
        }

        var retStr = {
            ret: 0,
            data: list
        };

        res.send(JSON.stringify(retStr));
    }) ()

};

exports.getone = function(req, res, next) {
    var id = req.params.id;
    var ep = new eventproxy();

    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var pps;

        pps = await Pps.getPpsById(id);

        /*TODO: add err handling here for no data found */
        
        var retStr = {
            ret: 0,
            data: pps
        };

        res.send(JSON.stringify(retStr));
    }) ()

};

exports.update = function(req, res, next) {
    var id = req.params.id;
    var phone = req.body.phone;
    var uid;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async() => {
        var pps = await Pps.getPpsById(id);
        if (!pps) {
            ep.emit('err', '设备厂商id错误');
            return;
        }
        
        var newPps = {
            name: req.body.name,
            //parkNum: req.body.parkNum,
            contacts: req.body.contacts,
            phone: req.body.phone,
            email: req.body.email
        };

        Pps.updatePps(pps, newPps);

        var retStr = {
            ret: 0
        };

        res.send(JSON.stringify(retStr));
    }) ()
   
};

exports.delete = function(req, res, next) {
    var id = req.params.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });


    (async() => {
        var pps = await Pps.getPpsById(id);
        if (!pps) {
            ep.emit('err', '设备厂商不存在');
            return;
        }

        Pps.deletePps(pps);

        var retStr = {
            ret: 0
        };

        res.send(JSON.stringify(retStr));
    }) ()
};

// /pps/namelist
exports.getNameList = function(req, res, next) {
    var list = [];
    var ep = new eventproxy();

    ep.fail(next);
    ep.on('err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg,str
        };

        res.send(JSON.stringify(retStr));
    });

    if(req.session.user.role != 'system') {
        ep.on('err', {ret: 8003, str: "无权限!"});
        return;
    }

    (async() => {
        var ppss;

        ppss = await Pps.query({});

        if (ppss.length > 0) {
            for (var i =0; i < ppss.length; i++) {
                list.push({ 
                    id:ppss[i].id,
                    name:ppss[i].name
                });
            }
        }

        var retStr = {
            ret: 0,
            data: list
        };

        res.send(JSON.stringify(retStr));
    }) ()
}

exports.updateParknum = function(pid, num, add) {

    (async() => {
        var pps = await Pps.getPpsById(pid);
        if (!pps) {
            return;
        }

        var parkNum = pps.parkNum;

        if (add) {
            parkNum += num;
        }
        else {
            parkNum -= num;
        }

        var newPps = {
            parkNum: parkNum
        };

        await Pps.updatePps(pps, newPps);
    }) ()
};
