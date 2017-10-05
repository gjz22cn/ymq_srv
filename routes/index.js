var express = require('express');
var router = express.Router();
var user = require('../control/user');
var auth = require('../middleware/auth');
var config = require('../config');
var crypto = require('crypto');
var User = require('../model/user');

var corp = require('../control/corp');
var acti = require('../control/activity');

var eventproxy = require('eventproxy');
const logger = require('../lib/logger').logger('file');


/* GET home page. */
router.get('/', function(req, res, next) {
    logger.info('This is an index page! -- log4js');
});

router.get('/rolemain', function(req, res, next) {

    logger.info('This is an index page! -- log4js');
    if (!req.session || !req.session.user) {
        res.render('login', {title: '共享车位'});
        return;
    }

    console.log(JSON.stringify(req.session.user));

    switch(req.session.user.role)
    {
        case "system":
            res.render('main_admin', {title: '共享车位'});
            break;
        case "changshang":
            res.render('main_changshang', {title: '共享车位'}); 
            break;
        case "xiaoqu":
            res.render('main_xiaoqu', {title: '共享车位'}); 
            break;
        case "user":
            res.render('main_user', {title: '共享车位'}); 
            break;
        default:
            res.render('login', {title: '共享车位'});
    };
});


router.post('/user', user.message_handle);
//router.post('/parking', auth.userRequired, park.message_handle);
//router.post('/xiaoqu', auth.userRequired, xiaoqu.message_handle);

router.get('/create_admin', function(req, res, next) {

    (async() => {
        var user = await User.getUserByName(config.admin);

        if (user) {
            User.deleteUser(user);
        }
        
        var md5 = crypto.createHash('md5');
        var pass = md5.update(config.admin_passwd).digest('base64');
        var admin = {
            login_name: config.admin,
            passwd: pass,
            phone_num: config.phone_num,
            role: 'system'
        };

        User.newAndSave(admin);
    
        res.redirect('/');
    }) ()
});

router.get('/overall_stat', function(req, res, next) {

    var ep = new eventproxy();
    ep.fail(next);
    ep.all('carport_total', 'carport_avail', 'park_num', 'app_num', function(data1, data2, data3, data4) {
        var retStr = {
            ret: 0,
            carport_total: data1,
            carport_avail: data2,
            park_num: data3,
            app_num: data4
        };

        res.send(JSON.stringify(retStr));
    });

    xiaoqu.getCarportNum(function(num1, num2) {
        ep.emit('carport_total', num1);
        ep.emit('carport_avail', num2);
    });

    xiaoqu.getXiaoquNum(function(num) {
        ep.emit('park_num', num);
    });

    user.getAppNum(function(num) {
        ep.emit('app_num', num);
    });
});

/* RESTful api start */
router.get('/user/getVerCode', user.sendSMS);
router.post('/user/vcLogin', user.verCodeLogin);
router.get('/user/logout', auth.userRequired, user.logout);
router.get('/user/:id', auth.userRequired, user.getone);
router.put('/user/:id', auth.userRequired, user.update);

router.post('/corporation', auth.userRequired, corp.add);
router.get('/corporation', auth.userRequired, corp.get);
router.get('/corporation/:id', auth.userRequired, corp.getone);
router.put('/corporation/:id', auth.userRequired, corp.update);
router.delete('/corporation/:id', auth.userRequired, corp.delete);
router.post('/corporation/join', auth.userRequired, corp.join);
router.post('/corporation/leave', auth.userRequired, corp.leave);

router.post('/activity', auth.userRequired, acti.add);
router.get('/activity', auth.userRequired, acti.get);
router.get('/activity/:id', auth.userRequired, acti.getone);
router.put('/activity/:id', auth.userRequired, acti.update);
router.delete('/activity/:id', auth.userRequired, acti.delete);
router.post('/activity/join', auth.userRequired, acti.join);

module.exports = router;
