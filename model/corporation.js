var Sequelize = require('sequelize');
var sequelize = require('../lib/mysql');
var User = require('./user');

var Corp = sequelize.define('corporation', {
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true},

    name: {type: Sequelize.STRING, allowNull: false},       //名称
    actAdd1: {type: Sequelize.STRING, defaultValue: null}, //活动地址1
    actAdd2: {type: Sequelize.STRING, defaultValue: null}, //活动地址2
    actAdd3: {type: Sequelize.STRING, defaultValue: null}, //活动地址3
    memNum: {type: Sequelize.INTEGER, defaultValue: 0},    //成员数目
}, {
    freezeTableName: true
}
);

Corp.belongsTo(User, {foreignKey: 'mgmtUid',  onDelete: 'SET NULL', constraints: false});

var corp = Corp.sync({force: false});

Corp.create = function(corp) {
    return Corp.create({
        name: corp.name,
        actAdd1: corp.actAdd1,
        actAdd2: corp.actAdd2,
        actAdd3: corp.actAdd3
    });
};

Corp.update = function(corp, newCorp) {
    corp.name = newCorp.name;
    corp.actAdd1 = newCorp.actAdd1;
    corp.actAdd2 = newCorp.actAdd2;
    corp.actAdd3 = newCorp.actAdd3;
    corp.memNum = newCorp.memNum;

    corp.save();
};

Corp.destroy = function(corp) {
    corp.destroy();
};

Corp.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Corp.findAll(filter);
};

Corp.getCount = function(filter) {
    return Corp.count({
        where: filter
    });
};

exports.Corp = Corp;

/* ******************************************
 *                card_mem
 * ****************************************** */
var Corpm = sequelize.define('corp_mem', {
}, {
    freezeTableName: true
}
);

Corpm.belongsTo(User, {foreignKey: 'userId',  onDelete: 'SET NULL', constraints: false});
Corpm.belongsTo(Corp, {foreignKey: 'corpId',  onDelete: 'SET NULL', constraints: false});


var corpm = Corpm.sync({force: false});

Corpm.create = function(corpm) {
    return Corpm.create({
        userId: corpm.userId,
        corpId: corpm.corpId
    });
};

Corpm.update = function(corpm, newCorpm) {
    corpm.userId = newCorpm.userId;
    corpm.corpId = newCorpm.corpId;

    corpm.save();
};

Corpm.destroy = function(corpm) {
    corpm.destroy();
};

Corpm.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Corpm.findAll(filter);
};

Corpm.getCount = function(filter) {
    return Corpm.count({
        where: filter
    });
};

exports.Corpm = Corpm;
