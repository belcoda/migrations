/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // email templates
  return (
    knex.schema
      .withSchema("public")
      .createSchema("communications")
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("email_templates", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("name").notNullable();
            t.text("from").notNullable();
            t.text("reply_to").notNullable();
            t.text("subject").notNullable();
            t.text("preview_text").notNullable().defaultTo("");
            t.text("html").notNullable().defaultTo("");
            t.text("text").notNullable().defaultTo("");
            t.boolean("active").notNullable().defaultTo(true);
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.unique(["instance_id", "name"]);
          });
      })
      // email messages
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("email_messages", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.integer("template_id")
              .notNullable()
              .references("id")
              .inTable("communications.email_templates");
            t.text("name").notNullable();
            t.text("from").notNullable();
            t.text("reply_to").notNullable();
            t.text("subject").notNullable();
            t.text("preview_text").notNullable();
            t.text("html").notNullable().defaultTo("");
            t.text("text").notNullable().defaultTo("");
            t.integer("point_person_id")
              .notNullable()
              .references("id")
              .inTable("public.admins");
            t.boolean("use_html_for_plaintext").notNullable().defaultTo(true);
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.unique(["instance_id", "name"]);
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("email_sends", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("name").notNullable();
            t.integer("message_id")
              .notNullable()
              .references("id")
              .inTable("communications.email_messages");
            t.integer("list_id")
              .nullable()
              .references("id")
              .inTable("people.lists");
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.integer("sent_by_id")
              .nullable()
              .references("id")
              .inTable("public.admins");
            t.timestamp("started_at").nullable();
            t.timestamp("completed_at").nullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sent_emails", function (t) {
            t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            t.integer("message_id")
              .notNullable()
              .references("id")
              .inTable("communications.email_messages");
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.integer("send_id")
              .nullable()
              .references("id")
              .inTable("communications.email_sends");
            t.timestamp("sent_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("received_emails", function (t) {
            t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            t.integer("message_id")
              .nullable()
              .references("id")
              .inTable("communications.email_messages");
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.text("subject").notNullable();
            t.text("message").notNullable();
            t.timestamp("received_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_numbers", function (t) {
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("number").notNullable();
            t.text("whatsapp_id").notNullable();
            t.text("status").notNullable().defaultTo("NOT_SUBMITTED");
            t.timestamp("clicked_at").defaultTo(knex.fn.now()).notNullable();
            t.unique(["instance_id", "number"]);
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .raw('CREATE DOMAIN "whatsapp_template" AS "jsonb";');
      })

      .then(() => {
        return knex.schema
          .withSchema("communications")
          .raw('CREATE DOMAIN "communication_actions" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .raw('CREATE DOMAIN "whatsapp_message" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .raw('CREATE DOMAIN "incoming_whatsapp_message" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .raw('CREATE DOMAIN "keyword_triggers" AS "jsonb";');
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_templates", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("name").notNullable();
            t.boolean("interactive").notNullable();
            t.text("whatsapp_id").nullable();
            t.specificType("message", "whatsapp_template").notNullable();
            t.text("status")
              .notNullable()
              .defaultTo("CREATED")
              .checkIn([
                "CREATED",
                "APPROVED",
                "PENDING",
                "REJECTED",
                "PAUSED",
              ]);
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.unique(["instance_id", "name"]);
            t.unique(["instance_id", "whatsapp_id"]);
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_threads", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.integer("template_id")
              .notNullable()
              .references("id")
              .inTable("communications.whatsapp_templates");
            t.uuid("template_message_id").notNullable();
            t.text("name").notNullable();
            t.unique(["instance_id", "name"]);
            /* t.specificType(
              "template_message",
              "whatsapp_message"
            ).notNullable(); */
            t.specificType("actions", "communication_actions")
              .notNullable()
              .defaultTo("{}");
            t.integer("point_person_id")
              .notNullable()
              .references("id")
              .inTable("public.admins");
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_messages", function (t) {
            t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.integer("thread_id")
              .nullable()
              .references("id")
              .inTable("communications.whatsapp_threads");
            t.text("wamid").nullable();
            t.specificType("actions", "communication_actions")
              .notNullable()
              .defaultTo("{}");
            t.specificType("keywords", "keyword_triggers")
              .notNullable()
              .defaultTo("{}");
            t.specificType("message", "whatsapp_message").notNullable();
            t.uuid("on_sent_action").nullable();
            t.uuid("on_read_action").nullable();
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.uuid("next").nullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .alterTable("whatsapp_messages", function (t) {
            t.foreign("next")
              .references("id")
              .inTable("communications.whatsapp_messages");
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .alterTable("whatsapp_threads", function (t) {
            t.foreign("template_message_id")
              .references("id")
              .inTable("communications.whatsapp_messages");
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_quick_replies", function (t) {
            t.increments("id");
            t.uuid("message_id")
              .notNullable()
              .references("id")
              .inTable("communications.whatsapp_messages");
            t.integer("thread_id")
              .notNullable()
              .references("id")
              .inTable("communications.whatsapp_threads");
            t.text("name").notNullable();
            t.unique(["thread_id", "name"]);
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_sends", function (t) {
            t.increments("id");
            t.integer("thread_id")
              .notNullable()
              .references("id")
              .inTable("communications.whatsapp_threads");
            t.integer("list_id")
              .notNullable()
              .references("id")
              .inTable("people.lists");
            t.integer("sent_by_id")
              .notNullable()
              .references("id")
              .inTable("public.admins");
            t.timestamp("started_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("completed_at").nullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("whatsapp_conversations", function (t) {
            t.increments("id");
            t.integer("thread_id")
              .nullable()
              .references("id")
              .inTable("communications.whatsapp_threads");
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.string("whatsapp_id").notNullable();
            t.unique("whatsapp_id");
            t.string("type").checkIn([
              "authentication",
              "marketing",
              "utility",
              "service",
              "referral_conversion",
            ]);
            t.boolean("expired").notNullable().defaultTo(false);
            t.timestamp("started_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("expires_at")
              .defaultTo(knex.raw("now() + interval '24 hours'"))
              .notNullable();
            t.index("whatsapp_id");
            /* CREATING THIS INDEX FAILS. NOT IMPORTANT FOR NOW...
    t.index('whatsapp_id', 'whatsapp_id_index', {
      predicate: knex.where('expired = false') 
    }) */
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sent_whatsapp_messages", function (t) {
            t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.uuid("message_id")
              .nullable()
              .references("id")
              .inTable("communications.whatsapp_messages");
            t.integer("conversation_id")
              .nullable()
              .references("id")
              .inTable("communications.whatsapp_conversations");
            t.specificType("message", "whatsapp_message").notNullable();
            t.text("wamid");
            t.boolean("delivered").notNullable().defaultTo(false);
            t.boolean("read").notNullable().defaultTo(false);
            t.boolean("reacted").notNullable().defaultTo(false);
            t.boolean("stale").notNullable().defaultTo(false);
            t.string("reacted_emoji", 1).nullable();
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
            t.index("wamid");
            /* CREATING THIS INDEX FAILS. NOT IMPORTANT FOR NOW...
    t.index('wamid', 'wamid_index', {
      predicate: knex.where('stale = false')
    }) */
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("received_whatsapp_messages", function (t) {
            t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            t.integer("person_id").references("id").inTable("people.people");
            t.integer("conversation_id")
              .nullable()
              .references("id")
              .inTable("communications.whatsapp_conversations");
            t.specificType(
              "message",
              "incoming_whatsapp_message"
            ).notNullable();
            t.boolean("reacted").notNullable().defaultTo(false);
            t.string("reacted_emoji", 1).nullable();
            t.text("wamid");
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("received_whatsapp_group_messages", function (t) {
            t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.integer("group_id")
              .notNullable()
              .references("id")
              .inTable("people.groups");
            t.text("platform").notNullable().checkIn(["whapi.cloud"]);
            t.specificType(
              "message",
              "incoming_whatsapp_message"
            ).notNullable();
            t.timestamp("received_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sms_numbers", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("number").notNullable();
            t.boolean("active");
            t.unique(["instance_id", "number"]);
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sms_threads", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.text("name").notNullable();
            t.integer("first_message_id").nullable();
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sms_messages", function (t) {
            t.increments("id");
            t.integer("instance_id")
              .notNullable()
              .references("id")
              .inTable("public.instances");
            t.integer("sms_number_id")
              .notNullable()
              .references("id")
              .inTable("communications.sms_numbers");
            t.text("message").notNullable();
            t.specificType("actions", "communication_actions")
              .notNullable()
              .defaultTo("{}");
            t.specificType("keywords", "keyword_triggers")
              .notNullable()
              .defaultTo("{}");
            t.integer("next").nullable();
            t.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .alterTable("sms_messages", function (t) {
            t.foreign("next")
              .references("id")
              .inTable("communications.sms_messages");
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .alterTable("sms_threads", function (t) {
            t.foreign("first_message_id")
              .references("id")
              .inTable("communications.sms_messages");
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sms_sends", function (t) {
            t.increments("id");
            t.integer("thread_id")
              .notNullable()
              .references("id")
              .inTable("communications.sms_threads");
            t.integer("list_id")
              .notNullable()
              .references("id")
              .inTable("people.lists");
            t.integer("sent_by_id")
              .notNullable()
              .references("id")
              .inTable("public.admins");
            t.timestamp("started_at").defaultTo(knex.fn.now()).notNullable();
            t.timestamp("completed_at").nullable();
          });
      })
      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("sent_sms", function (t) {
            t.increments("id");
            t.integer("message_id")
              .notNullable()
              .references("id")
              .inTable("communications.sms_messages");
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.timestamp("sent_at").defaultTo(knex.fn.now()).notNullable();
          });
      })

      .then(() => {
        return knex.schema
          .withSchema("communications")
          .createTable("received_sms", function (t) {
            t.increments("id");
            t.integer("person_id")
              .notNullable()
              .references("id")
              .inTable("people.people");
            t.text("message").notNullable();
            t.timestamp("received_at").defaultTo(knex.fn.now()).notNullable();
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
    .withSchema("communications")
    .dropTable("received_sms")
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("sent_sms");
    })
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("sms_sends");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .alterTable("sms_threads", function (t) {
          t.dropColumn("first_message_id");
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .alterTable("sms_messages", function (t) {
          t.dropColumn("next");
        });
    })
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("sms_messages");
    })
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("sms_threads");
    })
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("sms_numbers");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTableIfExists("received_whatsapp_group_messages");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("received_whatsapp_messages");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("sent_whatsapp_messages");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_sends");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_conversations");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_quick_replies");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .alterTable("whatsapp_threads", function (t) {
          t.dropForeign("template_message_id");
        });
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_messages");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_threads");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_templates");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .raw('DROP DOMAIN "keyword_triggers"');
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .raw('DROP DOMAIN "communication_actions"');
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .raw('DROP DOMAIN IF EXISTS "incoming_whatsapp_message"');
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .raw('DROP DOMAIN "whatsapp_message"');
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .raw('DROP DOMAIN "whatsapp_template"');
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("whatsapp_numbers");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("received_emails");
    })
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("sent_emails");
    })
    .then(() => {
      return knex.schema.withSchema("communications").dropTable("email_sends");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("email_messages");
    })
    .then(() => {
      return knex.schema
        .withSchema("communications")
        .dropTable("email_templates");
    })
    .then(() => {
      return knex.schema.dropSchema("communications");
    });
};
