
const { Sequelize, DataTypes } = require('sequelize');

// Hardcoded config to avoid TS import issues
const sequelize = new Sequelize(
    process.env.DB_NAME || "textisur_db",
    process.env.DB_USER || "textisur",
    process.env.DB_PASSWORD || "SQL55H7#",
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        dialectModule: require('mysql2'),
        logging: console.log,
    }
);

async function up() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('stores');

        if (!tableInfo.latitude) {
            console.log('Adding latitude column...');
            await queryInterface.addColumn('stores', 'latitude', {
                type: DataTypes.DECIMAL(10, 8),
                allowNull: true,
            });
        } else {
            console.log('Latitude column already exists.');
        }

        if (!tableInfo.longitude) {
            console.log('Adding longitude column...');
            await queryInterface.addColumn('stores', 'longitude', {
                type: DataTypes.DECIMAL(11, 8),
                allowNull: true,
            });
        } else {
            console.log('Longitude column already exists.');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

up();
