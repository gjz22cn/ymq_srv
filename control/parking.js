var Parking = require('../model/parking');
var Order = require('../model/transaction');
var Community = require('../model/community');
var eventproxy = require('eventproxy');
var User = require('../model/user');
var xiaoqu = require('./xiaoqu');
const moment = require('moment');


exports.message_handle = function(req, res, next) {
    console.log('req='+JSON.stringify(req.body));
    if ('MSG_TYPE_PARKING_PUBLISH' == req.body.type) {
        publish(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_MODIFY' == req.body.type) {
        modify(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_CANCEL' == req.body.type) {
        cancel(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_ORDER' == req.body.type) {
        order(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_ORDER_PRE' == req.body.type) {
        orderPre(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_ORDER_POST' == req.body.type) {
        orderPost(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_ORDER_CANCEL' == req.body.type) {
        orderCancel(req, res, next);
    }
    else if ('MSG_TYPE_PARKING_GET_MY_ORDER' == req.body.type) {
        getMyOrder(req, res, next);
    }
    else if ('MSG_TYPE_GET_HISTORY_PARK_INFO' == req.body.type) {
        getHistoryPark(req, res, next);
    }
    else {
        next();
    }
};

function publish(req, res, next) {
    
    var user_id = req.session.user.id;
    var cid = req.body.cid;

    var parking = {
        user_id: user_id,
        community_id: cid,
        parking_time_start: req.body.timeStart,
        parking_time_end: req.body.timeEnd,
        rate_type: req.body.rateType,
        rate: req.body.price,
        info: req.body.info
    };

    Parking.addInfo(parking).then((data)=> {
        var retStr = {
            type: req.body.type,
            ret: 0,
            id: data.id
        };

        console.log(JSON.stringify(retStr)); 

        res.send(JSON.stringify(retStr));
    });
}

function modify(req, res, next) {

    var id = req.body.parkingId;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('pub_err', function(msg) {
        var retStr = {
            type: req.body.type,
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var data = await Parking.getDataById(id);
        if (!data) {
            ep.emit('pub_err','车位信息错误');
            return;
        }

        var newInfo = {
            info: req.body.info,
            parking_time_start: req.body.timeStart,
            parking_time_end: req.body.timeEnd,
            rate_type: req.body.rateType,
            rate: req.body.price
        };

        Parking.updatePublish(data, newInfo);

        var retStr = {
            type: req.body.type,
            ret: 0
        };

        res.send(JSON.stringify(retStr));

    }) ()

}

function cancel(req, res, next) {

    var id = req.body.parkingId;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('pub_err', function(msg) {
        var retStr = {
            type: req.body.type,
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var data = await Parking.getDataById(id);
        if (!data) {
            ep.emit('pub_err','车位信息错误');
            return;
        }

        Parking.deletePublish(data);

        var retStr = {
            type: req.body.type,
            ret: 0
        };

        res.send(JSON.stringify(retStr));

    }) ()


}


function order(req, res, next) {

    var community_id = req.body.communityId;
    var user_id = req.session.user.id;
    var mode = req.body.mode;
    var info = req.body.parkingInfo;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            type: req.body.type,
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    var newOrder = {
        user_id: user_id,
        community_id: community_id,
        mode: mode,
        info: info
    }; 

    Order.newAndSave(newOrder).then((order) => {
        if (!order) {
            ep.emit('order_err', '数据库错误');
            return;
        }

        var retStr = {
            type: req.body.type,
            ret: 0,
            orderId: order.id
        };

        res.send(JSON.stringify(retStr));
    });
}

exports.preOrder = function orderPre(req, res, next) {
    var uid = req.session.user.id;
    var cid = req.body.cid;
    var resId = req.body.resId;
    var timeStart = (req.body.timeStart).replace(/-/g,"/");
    var timeEnd = (req.body.timeEnd).replace(/-/g,"/");
    var in_time = new Date(timeStart);
    var out_time = new Date(timeEnd);

    var resr = resId.split('_');
    var pay;
    var xqname;
    var chepai;
    var price_type;
    var amount;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {

        var xiaoqu = await Community.getXiaoquById(cid);
        if (!xiaoqu) {
            ep.emit('order_err', '小区信息错误');
            return;
        }

        if (xiaoqu.parking_num_remain  == 0) {
            ep.emit('order_err', '小区无空余车位');
            return;
        }

        if (resr[0] === 'p') {
            var parking = await Parking.getDataById(resr[1]);
            if (!parking) {
                ep.emit('order_err', '车位信息错误');
                return;
            }

            pay = parking.rate;
            price_type = parking.rate_type;
        }
        else {
            pay = xiaoqu.rate;
            price_type = xiaoqu.rate_type;
        }

        if (price_type == 'hour') {
            var micrs = out_time.getTime() - in_time.getTime();
            var hour = Math.ceil(micrs/(3600*1000));

            amount = pay * hour;
        }
        else {
            amount = pay;
        }

        xqname = xiaoqu.name;
        pps_id = xiaoqu.pps_id;

        var usr = await User.getUserById(uid);
        chepai = usr.car_license;

        var newOrder ={
            user_id: uid,
            community_id: cid,
            pps_id: pps_id,
            info: resId,
            state: 'pre',
            o_in_time: req.body.timeStart,
            o_out_time: req.body.timeEnd,
            xqname: xqname,
            chepai: chepai,
            price_type: price_type,
            deposit: pay,
            o_amount: amount
        };

        console.log("newOrder="+JSON.stringify(newOrder));

        var order = await Order.newAndSave(newOrder);
        if (!order) {
            ep.emit('order_err', '订单系统出错');
            return;
        }

        var retStr = {
            ret: 0,
            resId: resId,
            orderNumber: order.id,
            deposit: pay,
            total: amount
        };

        res.send(JSON.stringify(retStr));
    }) ()

}

exports.postOrder = function orderPost(req, res, next) {

    var id = req.body.orderNumber;
    var uid = req.session.user.id;
    //var pay = req.body.pay;
    //var timeStart = req.body.timeStart;
    //var timeEnd = req.body.timeEnd;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var filter = {
            user_id: uid,
            id: id
        };
        var order = await Order.queryOrder(filter);

        if (!order) {
            ep.emit('order_err', '订单号错误');
            return;
        }

        var cid = order.community_id;

        var newOrder = {
            //in_time: timeStart,
            //out_time: timeEnd,
            //amount: pay,
            state: 'progress'
        };

        await Order.updateOrder(order, newOrder);

        xiaoqu.updateCheweiCount(cid, 1, false);

        var retStr = {
            ret: 0
        };

        res.send(JSON.stringify(retStr));
    }) ()
    
}

exports.cancelOrder = function orderCancel(req, res, next) {
    var id = req.body.orderNumber;
    var uid = req.session.user.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var filter = {
            user_id: uid,
            id: id
        };
        var order = await Order.queryOrder(filter);
        if (!order) {
            ep.emit('order_err','订单号错误');
            return;
        }

        var cid = order.community_id;

        Order.deleteOrder(order);

        xiaoqu.updateCheweiCount(cid, 1, true);

        var retStr = {
            ret: 0
        };

        res.send(JSON.stringify(retStr));

    }) ()

}

exports.getCurrOrder = function getMyOrder(req, res, next) {
    var uid = req.session.user.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            ret: msg.ret,
            msg: msg.str
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var order = await Order.queryOrder({'user_id': uid, 'state': 'progress'});

        if (!order) {
            ep.emit('order_err', {ret:8001, str:'No Data!'});
            return;
        }

        var xiaoqu = await Community.getXiaoquById(order.community_id);

        var data = {
            orderNumber: order.id,
            communityName: xiaoqu.name,
            lon: xiaoqu.longitude,
            lat: xiaoqu.latitude,
            price: xiaoqu.rate,
            priceType: xiaoqu.rate_type,
            deposit: xiaoqu.rate,
            timeStart: moment(order.o_in_time).format('HH:mm'),
            timeEnd: moment(order.o_out_time).format('HH:mm'),
            totalPrice: order.o_amount
        };

        var retStr = {
            ret: 0,
            data: data
        };

        res.send(JSON.stringify(retStr));

    }) ()
}

exports.preOutPay = function(req, res, next) {
    var uid = req.session.user.id;
    //var time = (req.body.time).replace(/-/g,"/");
    var out_time = new Date();
    var oid = req.body.orderNumber;
    var amount;
    var margin;
    var per_amount;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async() => {
        var filter = {
            user_id: uid,
            id: oid
        };
        var order = await Order.queryOrder(filter);
        if (!order) {
            ep.emit('order_err', '订单号错误');
            return;
        }

        var c_in_time = order.c_in_time;
        if (c_in_time == null) {
            console.log('chepai:'+order.chepai+'没有入场时间');
            c_in_time = order.o_in_time;
        }

        var micrs = out_time.getTime() - c_in_time.getTime();
        var hour = Math.ceil(micrs/(3600*1000));
        var min = Math.ceil(micrs/(60*1000));

        if (order.price_type == 'hour') {
            amount = order.deposit * hour;
            margin = amount - order.deposit;
        }
        else {
            amount = order.deposit;
            margin = 0;
        }

        per_amount = Math.round(amount/hour);

        var o_order = {
            pay_time: out_time,
            margin: margin,
            amount: amount,
            per_amount: per_amount
        };
        
        console.log('newOrder='+JSON.stringify(o_order));

        await Order.updateOrder(order, o_order);

        var retStr ={
            ret: 0,
            orderNumber: oid,
            total: amount,
            margin: margin,
            deposit: order.deposit,
            time: min,
        };

        res.send(JSON.stringify(retStr));

    }) ()
  
};

exports.postOutPay = function(req, res, next) {
    var id = req.body.orderNumber;
    var uid = req.session.user.id;

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order_err', function(msg) {
        var retStr = {
            ret: 1,
            msg: msg
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var filter = {
            user_id: uid,
            id: id
        };
        var order = await Order.queryOrder(filter);

        if (!order) {
            ep.emit('order_err', '订单号错误');
            return;
        }

        var newOrder = {
            state: 'outpay'
        };

        await Order.updateOrder(order, newOrder);

        var retStr = {
            ret: 0
        };

        res.send(JSON.stringify(retStr));
    }) ()

};

exports.getMyHistoryPark = function getHistoryPark(req, res, next) {
    var filter = JSON.parse(req.query.filter);
    var uid = req.session.user.id;
    var start = filter.startIdx;
    var num = filter.num;
    var data = [];

    var ep = new eventproxy();
    ep.fail(next);
    ep.on('order', function(data) {
        var retStr = {
            ret: 0,
            data: data
        };

        res.send(JSON.stringify(retStr));
    });

    (async () => {
        var query = {
            user_id: uid,
            state: 'finish'
        };
        var orders = await Order.getOrdersByLimit(query, num, start, [['createdAt', 'desc']]);
                
        if (orders.length == 0) {
            ep.emit('order', []);
            return;
        }

        for (var i in orders) {
            var xiaoqu = await Community.getXiaoquById(orders[i].community_id);
            
            var list = {
                communityName: xiaoqu.name,
                timeStart: moment(orders[i].c_in_time).format('MM-DD HH:mm'),
                timeEnd: moment(orders[i].c_out_time).format('MM-DD HH:mm'),
                totalPrice: orders[i].amount
            };

            data.push(list);
        }

        ep.emit('order', data);

    }) ()
}

exports.getBill = function(req, res, next) {
    var filter = JSON.parse(req.query.filter);
    var data = [];

    if(req.session.user.role == 'changshang') {
        filter.pps_id = req.session.user.id;
    } else if(req.session.user.role == 'xiaoqu') {
        filter.community_id = req.session.user.id;
    }
    console.log(JSON.stringify(filter));

    (async() => {
        var orders = await Order.query(filter); 

        if (orders.length > 0) {
            for (var i in orders) {
                var list = {
                    chepai: orders[i].chepai,
                    xqname: orders[i].xqname,
                    in_time: moment(orders[i].c_in_time).format('YYYY-MM-DD HH:mm'),
                    out_time: moment(orders[i].c_out_time).format('YYYY-MM-DD HH:mm'),
                    amount: orders[i].amount
                }
                data.push(list); 
            }
        }

        var retStr = {
            ret: 0,
            data: data 
        };

        res.send(JSON.stringify(retStr));

    }) ()
};


exports.carInHandler = function(cid, chepai, in_time) {
    (async() => {
        var filter = {
            community_id: cid,
            chepai: chepai,
            state: 'progress'
        };

        var order = await Order.queryOrder(filter);
        if (!order) {
            return;
        }
        
        var timeIn = {
            c_in_time: in_time
        };

        await Order.updateOrder(order, timeIn);
       
    }) ()

};

exports.carOutHandler = function(cid, chepai, out_time) {
    var timeOut;

    (async() => {
        var query = {
            chepai: chepai,
            community_id: cid,
            c_out_time: {'$eq': null},
            state: {'$in': ['progress','outpay']},
            //pay_time: {'$ne': null}
        };

        var order = await Order.queryOrder(query);
        if (!order) {
            return;
        }

        var state = order.state;

        if (state == 'progress') {
            timeOut = {
                c_out_time: out_time,
                state: 'prepay'
            };
        }
        else {
            timeOut = {
                c_out_time: out_time,
                state: 'finish'
            };

            var pay_time = order.pay_time;
            var mics = out_time.getTime() - pay_time.getTime();
            var min = Math.floor(mics/(60*1000));

            console.log('time_expire='+min);
        }

        await Order.updateOrder(order, timeOut);

        xiaoqu.updateCheweiCount(cid, 1, true);

        if (state == 'outpay') {
            if (min > expireTime) {
                // expire 15mins,report mqtt
            }

        }
    }) ()

}


