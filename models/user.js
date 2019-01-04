'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(42),
      allowNull: false,
      charset: 'latin1'
    },
    hash: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(42),
      allowNull: false,
      charset: 'latin1'
    },
    first_name: {
      type: DataTypes.STRING(42),
      allowNull: false,
      charset: 'latin1'
    },
    last_name: {
      type: DataTypes.STRING(42),
      allowNull: false,
      charset: 'latin1'
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
    tableName: 'users'
  });
  User.associate = function (models) {
    // associations can be defined here
    models.User.hasMany(models.UserTweet, { foreignKey: { allowNull: true } });
    models.User.hasMany(models.Relationship, { foreignKey: { allowNull: false, name: 'follower' } });
    models.User.hasMany(models.Relationship, { foreignKey: { allowNull: false, name: 'target' } });
  };
  return User;
};
