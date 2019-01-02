'use strict';

const getSubset= (keys, obj) =>keys.reduce((a, c)=> ({ ...a, [c]: obj[c]}), {});

module.exports={
    getSubset
};