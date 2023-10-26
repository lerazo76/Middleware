//AQUI CREAR TODAS LAS BASES DE DATOS TANTO DE MONITOREO Y AUTCONSCIENCIA
//CERRAR CONEXIONES
const { Client } = require('pg');

// Configura la conexión a la base de datos
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5432, // Puerto por defecto de PostgreSQL
});

// Código SQL para crear la tabla
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS public.metricas
  (
      id serial NOT NULL,
      pid integer,
      sid integer,
      sidname text COLLATE pg_catalog."default",
      oid integer,
      oidname text COLLATE pg_catalog."default",
      aid integer,
      aidname text COLLATE pg_catalog."default",
      mid integer,
      midname text COLLATE pg_catalog."default",
      valor real,
      fecha timestamp with time zone,
      tipo text COLLATE pg_catalog."default",
      umbral text COLLATE pg_catalog."default",
      interpretacion text COLLATE pg_catalog."default",
      recomendacion text COLLATE pg_catalog."default",
      nombresimulacion text COLLATE pg_catalog."default",
      descripcionsimulacion text COLLATE pg_catalog."default",
      valorsimulacion integer,
      pidname text COLLATE pg_catalog."default",
      CONSTRAINT metricas_pkey PRIMARY KEY (id)
  )
  TABLESPACE pg_default;
  
  ALTER TABLE IF EXISTS public.metricas
      OWNER to postgres;
`;

(async () => {
  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('Conexión exitosa a la base de datos');

    // Ejecutar la consulta para crear la tabla
    await client.query(createTableQuery);
    console.log('Tabla creada exitosamente');
  } catch (err) {
    console.error('Error al crear la tabla:', err);
  } finally {
    // Cerrar la conexión a la base de datos
    await client.end();
    console.log('Conexión cerrada correctamente');
  }
})();

//Coloca tu codigo para crear tus BD Brandon -->