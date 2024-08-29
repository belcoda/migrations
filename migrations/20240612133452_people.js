/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("public")
    .createSchema("people")
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('CREATE DOMAIN "email" AS "jsonb";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('CREATE DOMAIN "phone_number" AS "jsonb";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('CREATE DOMAIN "whatsapp" AS "jsonb";');
    })
    .then(() => {
      return knex.schema.withSchema("people").createTable("people", (t) => {
        t.increments("id");
        t.integer("instance_id")
          .notNullable()
          .references("id")
          .inTable("public.instances");
        t.uuid("unique_id")
          .notNullable()
          .defaultTo(knex.raw("uuid_generate_v4()"));
        t.text("full_name").notNullable();
        t.text("preferred_name").nullable();
        t.text("given_name").nullable();
        t.text("given_name_alt").nullable();
        t.text("family_name").nullable();
        t.text("family_name_alt").nullable();

        t.timestamp("dob").nullable();
        t.text("organization").nullable();
        t.text("position").nullable();

        t.text("details").nullable();
        t.boolean("do_not_contact").defaultTo(false);
        t.string("preferred_language").notNullable();

        t.specificType("email", "email").nullable();
        t.specificType("phone_number", "phone_number").nullable();
        t.specificType("whatsapp", "whatsapp").nullable();

        t.text("address_line_1").nullable();
        t.text("address_line_2").nullable();
        t.text("address_line_3").nullable();
        t.text("address_line_4").nullable();
        t.text("locality").nullable();
        t.text("state").nullable();
        t.text("postcode").nullable();
        t.geometry("latlng").nullable();
        t.string("country").notNullable();

        t.integer("point_person_id")
          .references("id")
          .inTable("public.admins")
          .nullable();

        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
      });
    })
    .then(() => {
      return knex.schema.withSchema("people").raw(`
      CREATE VIEW people.people_search AS
      SELECT *,
        concat(full_name, ' ', given_name, ' ', family_name, ' ', email->>'email', ' ', phone_number->>'phone_number') AS search
      FROM people.people
    `);
    })

    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('CREATE DOMAIN "validation_rules" AS "jsonb";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("custom_fields", function (t) {
          t.increments("id");
          t.integer("instance_id").notNullable();
          t.foreign("instance_id").references("id").inTable("public.instances");
          t.text("slug").notNullable();
          t.unique(["instance_id", "slug"]);
          t.unique(["instance_id", "name"]);
          t.text("name").notNullable();
          t.text("label").notNullable();
          t.text("description").nullable();
          t.text("type").notNullable().defaultTo("text");
          t.specificType("validation", "validation_rules")
            .notNullable()
            .defaultTo(JSON.stringify([]));
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("custom_field_values", function (t) {
          t.integer("custom_field_id")
            .notNullable()
            .references("id")
            .inTable("people.custom_fields");
          t.integer("person_id")
            .notNullable()
            .references("id")
            .inTable("people.people");
          t.text("value").nullable();
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          t.primary(["person_id", "custom_field_id"]);
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("taggings", function (t) {
          t.integer("person_id")
            .notNullable()
            .references("id")
            .inTable("people.people");
          t.integer("tag_id")
            .notNullable()
            .references("id")
            .inTable("public.tags");
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.primary(["person_id", "tag_id"]);
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("lists", function (t) {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.text("name").notNullable();
          t.boolean("ready").defaultTo(false);
          t.boolean("perpetual").defaultTo(false);
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("expires_at")
            .defaultTo(knex.raw(`? + INTERVAL '? days'`, [knex.fn.now(), 60]))
            .notNullable();
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("list_people", function (t) {
          t.integer("list_id")
            .notNullable()
            .references("id")
            .inTable("people.lists");
          t.integer("person_id")
            .notNullable()
            .references("id")
            .inTable("people.people");
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.primary(["list_id", "person_id"]);
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createView("list_view", function (view) {
          view.columns([
            "id",
            "instance_id",
            "name",
            "ready",
            "perpetual",
            "created_at",
            "updated_at",
            "expires_at",
            "count",
          ]);
          view.as(
            knex.raw(`
        SELECT
          l.*,
          COUNT(lp.person_id) AS count
        FROM
          people.lists l
        LEFT JOIN
          people.list_people lp
        ON
          l.id = lp.list_id
        GROUP BY
          l.id
      `)
          );
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("groups", function (t) {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.text("name").notNullable();
          t.text("description").nullable();
          t.text("whatsapp_id").nullable();
          t.integer("point_person_id")
            .references("id")
            .inTable("public.admins")
            .nullable();
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("group_members", function (t) {
          t.integer("group_id")
            .notNullable()
            .references("id")
            .inTable("people.groups");
          t.integer("person_id")
            .notNullable()
            .references("id")
            .inTable("people.people");
          t.primary(["group_id", "person_id"]);
          t.text("status")
            .notNullable()
            .defaultTo("member")
            .checkIn(["member", "admin", "banned"]);
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('CREATE DOMAIN "interaction_type" AS "jsonb";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createTable("interactions", function (t) {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.integer("person_id")
            .notNullable()
            .references("id")
            .inTable("people.people");
          t.integer("admin_id")
            .notNullable()
            .references("id")
            .inTable("public.admins");
          t.specificType("details", "interaction_type").nullable();
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.index("person_id");
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .createView("list_interactions", function (view) {
          view.columns([
            "id",
            "instance_id",
            "person_id",
            "admin_id",
            "type",
            "details",
            "created_at",
          ]);
          view.as(
            knex.raw(`
      SELECT
        id, instance_id, person_id, admin_id, details->>'type' as type, details, created_at
      FROM
        people.interactions
    `)
          );
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("people")
    .dropView("list_view")
    .then(() => {
      return knex.schema
        .withSchema("people")
        .dropViewIfExists("list_interactions");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("interactions");
    })

    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('DROP DOMAIN "interaction_type";');
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("group_members");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("groups");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("list_people");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("lists");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("taggings");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("custom_field_values");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("custom_fields");
    })

    .then(() => {
      return knex.schema.withSchema("people").dropView("people_search");
    })
    .then(() => {
      return knex.schema.withSchema("people").dropTable("people");
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('DROP DOMAIN IF EXISTS "validation_rules";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('DROP DOMAIN IF EXISTS "whatsapp";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('DROP DOMAIN IF EXISTS "phone_number";');
    })
    .then(() => {
      return knex.schema
        .withSchema("people")
        .raw('DROP DOMAIN IF EXISTS "email";');
    })
    .then(() => {
      return knex.schema.dropSchema("people");
    });
};
