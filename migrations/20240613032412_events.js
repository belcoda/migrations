/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { custom_code, html_metatags } = require("../data/globals");
exports.up = function (knex) {
  return knex.schema
    .withSchema("public")
    .createSchema("events")
    .then(() => {
      return knex.schema.withSchema("events").createTable("events", (t) => {
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
        t.text("slug").notNullable();
        t.text("heading").notNullable();
        t.text("html").notNullable().defaultTo("");

        t.timestamp("starts_at").notNullable();
        t.timestamp("ends_at").notNullable();

        t.boolean("online").notNullable().defaultTo(false);
        t.text("online_url").nullable();
        t.text("online_instructions").nullable();

        t.text("address_line_1").nullable();
        t.text("address_line_2").nullable();
        t.text("address_line_3").nullable();
        t.text("address_line_4").nullable();
        t.text("locality").nullable();
        t.text("state").nullable();
        t.text("postcode").nullable();
        t.geometry("latlng").nullable();
        t.string("country").notNullable();

        t.integer("max_attendees").nullable();

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

        t.integer("registration_email")
          .notNullable()
          .references("id")
          .inTable("communications.email_messages");
        t.integer("reminder_email")
          .notNullable()
          .references("id")
          .inTable("communications.email_messages");
        t.integer("followup_email")
          .notNullable()
          .references("id")
          .inTable("communications.email_messages");
        t.integer("cancellation_email")
          .notNullable()
          .references("id")
          .inTable("communications.email_messages");

        t.boolean("send_registration_email").notNullable().defaultTo(true);
        t.boolean("send_reminder_email").notNullable().defaultTo(true);
        t.boolean("send_followup_email").notNullable().defaultTo(false);
        t.boolean("send_cancellation_email").notNullable().defaultTo(true);

        t.timestamp("reminder_sent_at").nullable();
        t.timestamp("followup_sent_at").nullable();

        t.integer("send_reminder_hours_before_start")
          .notNullable()
          .defaultTo(24);
        t.integer("send_followup_hours_after_end").notNullable().defaultTo(24);

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
      return knex.schema.withSchema("events").createTable("attendees", (t) => {
        t.integer("event_id")
          .notNullable()
          .references("id")
          .inTable("events.events");
        t.integer("person_id")
          .notNullable()
          .references("id")
          .inTable("people.people");
        t.text("status")
          .notNullable()
          .defaultTo("registered")
          .checkIn(["registered", "attended", "cancelled", "noshow"]);
        t.text("notes").nullable();
        t.boolean("send_notifications").notNullable().defaultTo(true);
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
        t.primary(["event_id", "person_id"]);
      });
    })
    .then(() => {
      return knex.schema
        .withSchema("events")
        .createView("event_attendees_view", function (view) {
          view.columns([
            "event_id",
            "person_id",
            "status",
            "notes",
            "created_at",
            "updated_at",
            "full_name",
            "given_name",
            "family_name",
            "email",
            "phone_number",
            "send_notifications",
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
          l.event_id as event_id,
          l.person_id as person_id,
          l.status as status,
          l.notes as notes,
          l.created_at as created_at,
          l.updated_at as updated_at,
          p.full_name as full_name,
          p.given_name as given_name,
          p.family_name as family_name,
          p.email as email,
          p.phone_number as phone_number,
          l.send_notifications as send_notifications,
          p.address_line_1 as address_line_1,
          p.address_line_2 as address_line_2,
          p.locality as locality,
          p.state as state,
          p.postcode as postcode,
          p.country as country
        FROM
          events.attendees l
        LEFT JOIN
          people.people p
        ON
          l.person_id = p.id
      `)
          );
        });
    })
    .then(() => {
      return knex.schema.withSchema("events").createTable("taggings", (t) => {
        t.integer("event_id")
          .notNullable()
          .references("id")
          .inTable("events.events");
        t.integer("tag_id")
          .notNullable()
          .references("id")
          .inTable("public.tags");
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.primary(["event_id", "tag_id"]);
      });
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("events")
    .dropTable("taggings")
    .then(() => {
      return knex.schema.withSchema("events").dropView("event_attendees_view");
    })
    .then(() => {
      return knex.schema.withSchema("events").dropTable("attendees");
    })
    .then(() => {
      return knex.schema.withSchema("events").dropTable("events");
    })
    .then(() => {
      return knex.schema.dropSchema("events");
    });
};
