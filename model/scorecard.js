/* ******************************************
 *                score_card
 * ****************************************** */
var Sequelize = require('sequelize');
var sequelize = require('../lib/mysql');
var User = require('./user');
var Corp = require('./corporation').Corp;

var Card = sequelize.define('score_card', {
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true},

    name:{type: Sequelize.STRING(64), allowNull: false}, //名称

    //类型1：排名、循环、AB队循环
    type1:{type: Sequelize.ENUM, values:['ranking', 'full-loop', 'combat-loop']},

    //类型2：单打、双打、团体、男单、女单、男双、女双、混双
    type2:{type: Sequelize.ENUM, values:['single', 'doubles', 'team', 'm-s', 'f-s', 'm-d', 'f-d', 'mix-d']},
}, {
    freezeTableName: true
}
);

Card.belongsTo(User, {foreignKey: 'mgmtUid',  onDelete: 'SET NULL', constraints: false});
Card.belongsTo(Corp, {foreignKey: 'corpId',  onDelete: 'SET NULL', constraints: false});

var card = Card.sync({force: false});

Card.create = function(card) {
    return Card.create({
        name: card.name
    });
};

Card.update = function(card, newCard) {
    card.name = newCard.name;

    card.save();
};

Card.destroy = function(card) {
    card.destroy();
};

Card.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Card.findAll(filter);
};

Card.getCount = function(filter) {
    return Card.count({
        where: filter
    });
};

exports.Card = Card;

/* ******************************************
 *                card_mem
 * ****************************************** */
var Cardm = sequelize.define('card_mem', {
}, {
    freezeTableName: true
}
);

Cardm.belongsTo(User, {foreignKey: 'userId',  onDelete: 'SET NULL', constraints: false});
Cardm.belongsTo(Card, {foreignKey: 'cardId',  onDelete: 'SET NULL', constraints: false});


var cardm = Cardm.sync({force: false});

Cardm.create = function(cardm) {
    return Cardm.create({
        userId: cardm.userId,
        cardId: cardm.cardId
    });
};

Cardm.update = function(Cardm, newCardm) {
    cardm.userId = newCardm.userId;
    cardm.cardId = newCardm.cardId;

    cardm.save();
};

Cardm.destroy = function(cardm) {
    cardm.destroy();
};

Cardm.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Cardm.findAll(filter);
};

Cardm.getCount = function(filter) {
    return Cardm.count({
        where: filter
    });
};

exports.Cardm = Cardm;


/* ******************************************
 *                score_item
 * ****************************************** */
var Sitem = sequelize.define('score_item', {
    id:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true},

    score:{type: Sequelize.STRING(6), defaultValue: null},  //比分
    date:{type: Sequelize.DATEONLY},         //比赛时间
    state:{type: Sequelize.ENUM, values:['unfinish', 'finish'], defaultValue: "unfinish"}, //计分条目状态
    stateL:{type: Sequelize.ENUM, values:['0', '1', '2']},  //左边状态    0-确认1,1-确认2,2-已确认
    stateR:{type: Sequelize.ENUM, values:['0', '1', '2']},  //右边状态    0-确认1,1-确认2,2-已确认
    nameL1:{type: Sequelize.STRING(32), defaultValue: ""},  //左边选手1名称   
    nameL2:{type: Sequelize.STRING(32), defaultValue: ""},  //左边选手2名称   
    nameR1:{type: Sequelize.STRING(32), defaultValue: ""},  //右边选手1名称   
    nameR2:{type: Sequelize.STRING(32), defaultValue: ""},  //右边选手2名称   
}, {
    freezeTableName: true
}
);

Sitem.belongsTo(Card, {foreignKey: 'cardId',  onDelete: 'SET NULL', constraints: false});


var sitem = Sitem.sync({force: false});

Sitem.create = function(sitem) {
    return Sitem.create({
        score: sitem.score,
        date: sitem.date,
    });
};

Sitem.update = function(sitem, newSitem) {
    sitem.nickName = newSitem.nickName;

    sitem.save();
};

Sitem.destroy = function(sitem) {
    sitem.destroy();
};

Sitem.query = function(qfilter) {
    var filter = {
        where: qfilter
    };
    return Sitem.findAll(filter);
};

Sitem.getCount = function(filter) {
    return Sitem.count({
        where: filter
    });
};

exports.Sitem = Sitem;
