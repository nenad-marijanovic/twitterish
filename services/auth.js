'use strict';

const hashing= require('../utils/hashing');

async function checkPassword(hash, password){

    const ok=await hashing.check(password, hash);

    if(!ok){
        return false;
    }

    return true;
}




module.exports={
    checkPassword
};