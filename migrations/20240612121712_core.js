/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  //EXTENSIONS
  return (
    knex.schema
      .withSchema("public")
      .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE EXTENSION IF NOT EXISTS "postgis"');
      })
      // core types
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "html_metatags" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "custom_code" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "email_message" AS "jsonb";');
      })
      // Instance
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "instance_settings" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "instance_secrets" AS "jsonb";');
      })
      // Admin
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "admin_permissions" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .createTable("instances", (t) => {
            t.increments("id");
            t.text("name").notNullable();
            t.text("slug").notNullable();
            t.text("owner_email").notNullable();
            t.text("plan").defaultTo("free").notNullable();
            t.text("language").defaultTo("en").notNullable();
            t.text("country").defaultTo("us").notNullable();
            t.boolean("installed").defaultTo(false).notNullable();
            t.specificType("settings", "instance_settings")
              .notNullable()
              .defaultTo("{}");
            t.specificType("secrets", "instance_secrets")
              .notNullable()
              .defaultTo("{}");
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.unique("slug");
            t.unique("name");
            t.unique("owner_email");
            t.index("slug");
          });
      })
      .then(() => {
        return knex.schema.withSchema("public").createTable("admins", (t) => {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.text("email").notNullable();
          t.text("full_name").notNullable(),
            t.text("profile_picture_url").nullable(),
            t.text("google_access_token").nullable(),
            t.text("google_refresh_token").nullable(),
            t.text("google_id").nullable(),
            t.text("google_expires_in").nullable(),
            t.text("google_token_type").nullable(),
            t.text("notification_schedule").notNullable().defaultTo("daily"),
            t.text("notification_channel").notNullable().defaultTo("email"),
            t.boolean("active").notNullable().defaultTo(true);
          t.boolean("has_signed_in").notNullable().defaultTo(false);
          t.specificType("permissions", "admin_permissions")
            .defaultTo('["all"]')
            .notNullable();
          t.uuid("api_key")
            .notNullable()
            .defaultTo(knex.raw("uuid_generate_v4()"));
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          t.unique("email");
        });
      })
      .then(() => {
        return knex.schema.withSchema("public").createTable("sessions", (t) => {
          t.uuid("code")
            .primary()
            .notNullable()
            .defaultTo(knex.raw("uuid_generate_v4()"));
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.integer("admin_id")
            .notNullable()
            .references("id")
            .inTable("public.admins");
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("expires_at")
            .defaultTo(knex.raw(`? + INTERVAL '? day'`, [knex.fn.now(), 1]))
            .notNullable();
        });
      })
      .then(() => {
        return knex.schema.withSchema("public").createTable("tags", (t) => {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.text("name").notNullable();
          t.boolean("active").notNullable().defaultTo(true);
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          t.unique(["instance_id", "name"]);
        });
      })
      //functions
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "function_steps" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .createTable("functions", (t) => {
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("name").notNullable();
            t.text("description").nullable();
            t.integer("run_as")
              .notNullable()
              .references("id")
              .inTable("public.admins");
            t.specificType("steps", "function_steps")
              .notNullable()
              .defaultTo("[]");
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      //tasks
      .then(() => {
        return knex.schema
          .withSchema("public")
          .raw('CREATE DOMAIN "task_details" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .createTable("tasks", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.integer("assigned_to")
              .notNullable()
              .references("id")
              .inTable("public.admins");
            t.text("name").notNullable();
            t.text("description").nullable();
            t.specificType("details", "task_details").notNullable();
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("due_at").nullable();
            t.timestamp("completed_at").nullable();
            t.timestamp("viewed_at").nullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("public")
          .createTable("task_taggings", function (t) {
            t.integer("task_id")
              .notNullable()
              .references("id")
              .inTable("public.tasks");
            t.integer("tag_id")
              .notNullable()
              .references("id")
              .inTable("public.tags");
            t.primary(["task_id", "tag_id"]);
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
  );
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("public")
    .dropTable("task_taggings")
    .then(() => {
      return knex.schema.withSchema("public").dropTable("tasks");
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "task_details";');
    })
    .then(() => {
      return knex.schema.withSchema("public").dropTable("functions");
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "function_steps";');
    })
    .then(() => {
      return knex.schema.withSchema("public").dropTable("tags");
    })
    .then(() => {
      return knex.schema.withSchema("public").dropTable("sessions");
    })
    .then(() => {
      return knex.schema.withSchema("public").dropTable("admins");
    })
    .then(() => {
      return knex.schema.withSchema("public").dropTable("instances");
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "admin_permissions";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "instance_settings";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "instance_secrets";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "custom_code";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "html_metatags";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP DOMAIN IF EXISTS "email_message";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP EXTENSION IF EXISTS "postgis";');
    })
    .then(() => {
      return knex.schema
        .withSchema("public")
        .raw('DROP EXTENSION IF EXISTS "uuid-ossp";');
    });
};
