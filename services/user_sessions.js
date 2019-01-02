'use strict';

const db=require('../models');
const logger=require('../utils/logger');

const Op= db.Sequelize.Op;

async function setUserSession(sessionId, userId){
    console.log("usao:"+userId+"    "+sessionId);
    const user=await db.UserSession.create({ user_id: userId, session_id: sessionId });

    if(!user){
        throw new Error();
    }
}



module.exports={
    setUserSession
};