'use strict';
module.exports = (sequelize, DataTypes) => {
  var Relationship = sequelize.define('Relationship', {

    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    target: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    follower: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },

  }, {});
  Relationship.associate = function(models) {
    // associations can be defined here
    Relationship.belongsTo(models.User, {
      as: 'target_id',
      foreignKey: 'target'
  });
  
  Relationship.belongsTo(models.User, {
      as: 'follower_id',
      foreignKey: 'follower'
  });

  };
  return Relationship;
};