import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

// Configuración de Sequelize para conectarse a la base de datos local
const sequelize = new Sequelize(
  process.env.DB_NAME || "textisur_db",
  process.env.DB_USER || "textisur",
  process.env.DB_PASSWORD || "SQL55H7#",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    dialectModule: mysql2,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  },
);

// Verificar la conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });

export default sequelize;
