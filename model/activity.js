var Sequelize = require('sequelize');
var sequelize = require('../lib/mysql');

var Acti = sequelize.define('activity', {
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true},

    date: {type: Sequelize.DATEONLY, allowNull: false}, //活动日期:年-月-日
    start: {type: Sequelize.DATE(6), allowNull: false}, //开始时间    时：分
    end: {type: Sequelize.DATE(6)},                     //结束时间    时：分
    addr: {type: Sequelize.STRING, defaultValue: null}, //活动地址    
    comment: {type: Sequelize.STRING, defaultValue: null},//备注    
}, {
    freezeTableName: true
}
);

Acti.belongsTo(Acti, {foreignKey: 'ActiId',  onDelete: 'SET NULL', constraints: false});

var acti = Acti.sync({force: false});

Acti.create = function(acti) {
    return Acti.create({
        name: acti.name,
        actAdd1: acti.actAdd1,
        actAdd2: acti.actAdd2,
        actAdd3: acti.actAdd3
    });
};

Acti.update = function(acti, newActi) {
    acti.name = newActi.name;
    acti.actAdd1 = newActi.actAdd1;
    acti.actAdd2 = newActi.actAdd2;
    acti.actAdd3 = newActi.actAdd3;
    acti.memNum = newActi.memNum;

    acti.save();
};

Acti.destroy = function(acti) {
    acti.destroy();
};

Acti.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Acti.findAll(filter);
};

Acti.getCount = function(filter) {
    return Acti.count({
        where: filter
    });
};

exports.Acti = Acti;

/* ******************************************
 *                act_mem
 * ****************************************** */
var Actm = sequelize.define('act_mem', {
    people:{type: Sequelize.INTEGER, defaultValue:0} //报名人数
}, {
    freezeTableName: true
}
);

Actm.belongsTo(User, {foreignKey: 'userId',  onDelete: 'SET NULL', constraints: false});
Actm.belongsTo(Acti, {foreignKey: 'actId',  onDelete: 'SET NULL', constraints: false});


var cctm = Actm.sync({force: false});

Actm.create = function(actm) {
    return Actm.create({
        userId: actm.userId,
        actId: actm.actId,
        people: actm.people
    });
};

Actm.update = function(actm, newActm) {
    actm.userId = newActm.userId;
    actm.actId = newActm.actId;
    actm.people = newActm.people;

    actm.save();
};

Actm.destroy = function(actm) {
    actm.destroy();
};

Actm.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Actm.findAll(filter);
};

Actm.getCount = function(filter) {
    return Actm.count({
        where: filter
    });
};

exports.Actm = Actm;
