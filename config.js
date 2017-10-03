/**
 * config
 */

var config = {
    host: 'localhost',
    database: 'cheweidb',
    db_username: 'chewei',
    db_passwd: '123456',

    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_db: 0,
    redis_passwd: '',

    session_secret: 'chewei_secret',
    auth_cookie_name: 'chewei',

    admin: 'admin',
    admin_passwd: 'admin',
    phone_num: '18918903559'
};

module.exports = config;
