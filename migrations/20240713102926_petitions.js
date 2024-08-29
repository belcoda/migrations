/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { custom_code, html_metatags } = require("../data/globals");
exports.up = function (knex) {
  return knex.schema
    .withSchema("public")
    .createSchema("petitions")
    .then(() => {
      return knex.schema
        .withSchema("petitions")
        .createTable("petitions", (t) => {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.integer("template_id")
            .notNullable()
            .references("id")
            .inTable("website.templates");
          t.text("name").notNullable();
          t.text("petition_target").notNullable();
          t.text("petition_text").notNullable();
          t.text("slug").notNullable();
          t.text("heading").notNullable();
          t.text("html").notNullable().defaultTo("");

          t.integer("point_person_id")
            .notNullable()
            .references("id")
            .inTable("public.admins");

          t.boolean("ask_email").notNullable().defaultTo(true);
          t.boolean("require_email").notNullable().defaultTo(true);
          t.boolean("ask_phone_number").notNullable().defaultTo(true);
          t.boolean("require_phone_number").notNullable().defaultTo(true);
          t.boolean("ask_postcode").notNullable().defaultTo(true);
          t.boolean("require_postcode").notNullable().defaultTo(true);
          t.boolean("ask_address").notNullable().defaultTo(true);
          t.boolean("require_address").notNullable().defaultTo(false);

          t.integer("feature_image_upload_id")
            .nullable()
            .references("id")
            .inTable("website.uploads");

          t.integer("autoresponse_email")
            .notNullable()
            .references("id")
            .inTable("communications.email_messages");
          t.boolean("send_autoresponse_email").notNullable().defaultTo(true);

          t.specificType("custom_code", "custom_code")
            .notNullable()
            .defaultTo(custom_code);
          t.specificType("html_metatags", "html_metatags")
            .notNullable()
            .defaultTo(html_metatags);
          t.boolean("active").notNullable().defaultTo(true);
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("published_at").nullable();
          t.unique(["instance_id", "slug"]);
          t.unique(["instance_id", "name"]);
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("petitions")
        .createTable("signatures", (t) => {
          t.integer("petition_id")
            .notNullable()
            .references("id")
            .inTable("petitions.petitions");
          t.integer("person_id")
            .notNullable()
            .references("id")
            .inTable("people.people");
          t.boolean("send_autoresponse").notNullable().defaultTo(true);
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.primary(["petition_id", "person_id"]);
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("petitions")
        .createView("petition_signatures_view", function (view) {
          view.columns([
            "petition_id",
            "person_id",
            "created_at",
            "full_name",
            "given_name",
            "family_name",
            "email",
            "phone_number",
            "send_autoresponse",
            "address_line_1",
            "address_line_2",
            "locality",
            "state",
            "postcode",
            "country",
          ]);
          view.as(
            knex.raw(`
        SELECT
          l.petition_id as petition_id,
          l.person_id as person_id,
          l.created_at as created_at,
          p.full_name as full_name,
          p.given_name as given_name,
          p.family_name as family_name,
          p.email as email,
          p.phone_number as phone_number,
          l.send_autoresponse as send_autoresponse,
          p.address_line_1 as address_line_1,
          p.address_line_2 as address_line_2,
          p.locality as locality,
          p.state as state,
          p.postcode as postcode,
          p.country as country
        FROM
          petitions.signatures l
        LEFT JOIN
          people.people p
        ON
          l.person_id = p.id
      `)
          );
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("petitions")
        .createTable("taggings", (t) => {
          t.integer("petition_id")
            .notNullable()
            .references("id")
            .inTable("petitions.petitions");
          t.integer("tag_id")
            .notNullable()
            .references("id")
            .inTable("public.tags");
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.primary(["petition_id", "tag_id"]);
        });
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("petitions")
    .dropTable("taggings")
    .then(() => {
      return knex.schema
        .withSchema("petitions")
        .dropView("petition_signatures_view");
    })
    .then(() => {
      return knex.schema.withSchema("petitions").dropTable("signatures");
    })
    .then(() => {
      return knex.schema.withSchema("petitions").dropTable("petitions");
    })
    .then(() => {
      return knex.schema.dropSchema("petitions");
    });
};
