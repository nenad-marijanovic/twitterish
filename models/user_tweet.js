'use strict';

const sequelizePaginate = require('sequelize-paginate');

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
    timestamp: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE
    }

  }, {
    underscored: true,
    freezeTableName: true,
    tableName: 'user_tweets' });
  UserTweet.associate = function (models) {
    // associations can be defined here
    models.UserTweet.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };
  return UserTweet;
};
