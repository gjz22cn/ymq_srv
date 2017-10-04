var Sequelize = require('sequelize');
var sequelize = require('../lib/mysql');

var User = sequelize.define('user', {
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true},

    openId: {type: Sequelize.STRING, unique: true}, // weixin ID
    phone: {type: Sequelize.STRING(11)},
    password: {type: Sequelize.STRING(128)},
    nickName: {type: Sequelize.STRING(128)},
    gender: {type: Sequelize.ENUM, values:['male', 'female']},
    country: {type: Sequelize.STRING(16)},
    province: {type: Sequelize.STRING(16)},
    city: {type: Sequelize.STRING(16)},
    avatarUrl: {type: Sequelize.STRING},
    unionId: {type: Sequelize.STRING(32)},
    appId: {type: Sequelize.STRING(32)},
    loginTime: {type: Sequelize.DATE},
}, {
    freezeTableName: true
}
);

var user = User.sync({force: false});

User.create = function(user) {
    return User.create({
        openId: user.openId,
        nickName : user.nickName,
    });
};

User.update = function(user, newUser) {
    user.nickName = newUser.nickName;

    user.save();
};

User.destroy = function(user) {
    user.destroy();
};

User.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return User.findAll(filter);
};

User.getCount = function(filter) {
    return User.count({
        where: filter
    });
};

module.exports = User;
