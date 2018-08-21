const logger = require('../utils/logger').logger('mongo-user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.model('Users', new Schema({
    id: { type: String, unique: true, required: true},
    wechat: {
        nickName : String,
        gender   : String,
        city     : String,
        province : String,
        country  : String,
        avatarUrl: String,
        language : String
    }
}));

const User = mongoose.model('Users');

const model = {};

model.getInfo = async (userId) => {
    logger.debug(`Looking up user ${userId}`);

    const condition = {id : userId};
    return await User.findOne(condition).exec();
};

model.updateWechatInfo = async (userId, wechatInfo) => {
    const oriUser = await User.findOne({id : userId}).exec();
    
    if (oriUser) {
        let newUser = { id : userId, wechat : wechatInfo };
        oriUser.set(newUser);
        await oriUser.save();
        logger.debug(`update user ${userId} wechat info successful!`);
        return;
    }

    const user = new User({
        id : userId,
        wechat  : wechatInfo
    });
    await user.save();
    logger.debug(`Add new user ${userId}:${wechatInfo.nickName} successful!`);
}

module.exports = model;