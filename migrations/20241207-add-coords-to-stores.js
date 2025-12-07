'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('stores', 'latitude', {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: true,
        });
        await queryInterface.addColumn('stores', 'longitude', {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('stores', 'latitude');
        await queryInterface.removeColumn('stores', 'longitude');
    }
};
