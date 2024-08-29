# Migrations for Belcoda Core

This is a repo for the database migrations for <a href="https://github.com/belcoda/core" target="_blank">Belcoda Core</a>.

It also contains sample data and seeds which may be useful for development and for project contributors.

Please refer to the Belcoda Core readme for documentation on how to use these migrations in the context of deploying Belcoda Core.

## Configuration

Copy sample.env to .env, and set the database environment variables for the development, staging and production environments as required.

If your database requires an SSL certificate, you can create one at `ca.certificate.crt` in the root folder. Look at `knexfile.js` for more information.

Create a file at `./data/_private/admins.js` which contains:

```js
module.exports = function (instanceId) {
  return [
    {
      instance_id: instanceId,
      full_name: "Example Admin",
      email: "example@example.com",
    },
  ];
};
```

Replace `Example Admin` and `example@example.com` which your own initial admin account. The email address MUST be a Google Account.

For more details, look at `./seeds/init.js`.

## Running migrations

All migrations are created with Knex. For details on how to run the migrations, please refer to the <a href="https://knexjs.org/" target="_blank">Knex documentation</a>.

## License

Distributed under the MIT License. See `LICENSE` for more information.
