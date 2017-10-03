/**
 * config
 */

var config = {
    host: 'localhost',
    database: 'ymqdb',
    db_username: 'ymqc',
    db_passwd: '123456',

    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_db: 0,
    redis_passwd: '',

    session_secret: 'ymq_secret',
    auth_cookie_name: 'ymq',

    admin: 'admin',
    admin_passwd: 'admin',
    phone_num: '18918903559'
};

module.exports = config;
