module.exports = ({ env }) => {
  const dbUrl = env('DATABASE_URL');

  if (dbUrl) {
    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: dbUrl,
          ssl: { rejectUnauthorized: false }, // ESSA LINHA É OBRIGATÓRIA NO RENDER
        },
        debug: false,
      },
    };
  }

  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: '.tmp/data.db',
      },
      useNullAsDefault: true,
    },
  };
};