'use strict';
module.exports = (sequelize, DataTypes) => {
  var UserTweet = sequelize.define('UserTweet', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      allowNull: false,
      type: DataTypes.BIGINT.UNSIGNED
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },


  }, {
    underscored: true,
    freezeTableName: true,
    tableName: 'user_tweets'});
  UserTweet.associate = function(models) {
    // associations can be defined here
  };
  return  UserTweet;
};