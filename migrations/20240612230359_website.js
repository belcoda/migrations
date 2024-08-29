/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 */

const { custom_code, html_metatags } = require("../data/globals");
exports.up = function (knex) {
  return knex.schema
    .withSchema("public")
    .createSchema("website")
    .then(() => {
      return knex.schema.withSchema("website").createTable("templates", (t) => {
        t.increments("id");
        t.integer("instance_id")
          .notNullable()
          .references("id")
          .inTable("public.instances");
        t.text("name").notNullable();
        t.text("description").nullable();
        t.text("html").notNullable().defaultTo("");
        t.specificType("custom_code", "custom_code")
          .notNullable()
          .defaultTo(custom_code);
        t.specificType("html_metatags", "html_metatags")
          .notNullable()
          .defaultTo(html_metatags);
        t.boolean("active").notNullable().defaultTo(true);
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
      });
    })
    .then(() => {
      return knex.schema
        .withSchema("website")
        .createTable("uploads", function (t) {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.text("file_name").notNullable();
          t.text("mime_type").notNullable();
          t.integer("size").notNullable();
          t.text("url").notNullable();
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("website")
        .createTable("content_types", (t) => {
          t.increments("id");
          t.integer("instance_id")
            .notNullable()
            .references("id")
            .inTable("public.instances");
          t.integer("collection_template_id")
            .notNullable()
            .references("id")
            .inTable("website.templates");
          t.integer("content_template_id")
            .notNullable()
            .references("id")
            .inTable("website.templates");
          t.text("name").notNullable();
          t.text("slug").notNullable();
          t.boolean("active").notNullable().defaultTo(true);
          t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          t.unique(["instance_id", "slug"]);
          t.unique(["instance_id", "name"]);
        });
    })
    .then(() => {
      return knex.schema.withSchema("website").createTable("blocks", (t) => {
        t.increments("id");
        t.integer("instance_id")
          .notNullable()
          .references("id")
          .inTable("public.instances");
        t.text("name").notNullable();
        t.text("description").nullable();
        t.text("slug").notNullable();
        t.text("html").notNullable().defaultTo("");
        t.text("custom_css").nullable();
        t.text("custom_js").nullable();
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
        t.unique(["instance_id", "slug"]);
        t.unique(["instance_id", "name"]);
      });
    })
    .then(() => {
      return knex.schema.withSchema("website").createTable("content", (t) => {
        t.increments("id");
        t.integer("content_type_id")
          .notNullable()
          .references("id")
          .inTable("website.content_types");
        t.integer("template_id")
          .notNullable()
          .references("id")
          .inTable("website.templates");
        t.text("name").notNullable();
        t.text("slug").notNullable();
        t.text("heading").notNullable();
        t.text("html").notNullable().defaultTo("");
        t.integer("feature_image_upload_id")
          .nullable()
          .references("id")
          .inTable("website.uploads");
        t.specificType("custom_code", "custom_code")
          .notNullable()
          .defaultTo("{}");
        t.specificType("html_metatags", "html_metatags")
          .notNullable()
          .defaultTo("{}");
        t.boolean("active").notNullable().defaultTo(true);
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("published_at").nullable();
        t.unique(["content_type_id", "slug"]);
        t.unique(["content_type_id", "name"]);
      });
    })
    .then(() => {
      return knex.schema.withSchema("website").createTable("taggings", (t) => {
        t.integer("content_id")
          .notNullable()
          .references("id")
          .inTable("website.content");
        t.integer("tag_id")
          .notNullable()
          .references("id")
          .inTable("public.tags");
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.primary(["content_id", "tag_id"]);
      });
    })
    .then(() => {
      return knex.schema.withSchema("website").createTable("redirects", (t) => {
        t.increments("id");
        t.integer("instance_id")
          .notNullable()
          .references("id")
          .inTable("public.instances");
        t.text("from").notNullable();
        t.text("to").notNullable();
        t.unique(["instance_id", "from"]);
        t.boolean("active").notNullable().defaultTo(true);
        t.boolean("canonical").notNullable().defaultTo(false);
        t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
      });
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("website")
    .dropTable("redirects")
    .then(() => {
      return knex.schema.withSchema("website").dropTable("taggings");
    })
    .then(() => {
      return knex.schema.withSchema("website").dropTable("content");
    })
    .then(() => {
      return knex.schema.withSchema("website").dropTable("blocks");
    })
    .then(() => {
      return knex.schema.withSchema("website").dropTable("content_types");
    })
    .then(() => {
      return knex.schema.withSchema("website").dropTable("uploads");
    })
    .then(() => {
      return knex.schema.withSchema("website").dropTable("templates");
    })
    .then(() => {
      return knex.schema.dropSchema("website");
    });
};
