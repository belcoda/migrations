/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const generateSamplePeople = require("../data/sample_people");
const generateEmailTemplate = require("../data/email_template.js");
const generatePageTemplates = require("../data/page_templates.js");
const generateEventNotificationTemplates = require("../data/templates/event_templates.js");
const generateHandlebarsPageTemplates = require("../data/templates/page_templates.js");

const privateAdmins = require("../data/_private/admins.js"); //this file is not included in the repo. Replace with your own inital admins. Must be email addresses with corresponding google accounts.

exports.seed = async function (knex) {
  const instanceResponse = await knex("instances")
    .insert({
      name: "Belcoda Test",
      slug: "belcoda-test",
      owner_email: "example@example.com",
      settings: {},
      secrets: { WHATSAPP_ACCESS_KEY: "1234567890" }, //replace this with your actual key or use env vars
    })
    .returning("*");
  const instance = instanceResponse[0];
  console.log("instance", instance);

  const adminResponse = await knex("admins")
    .insert(privateAdmins(instance.id))
    .returning("*");
  const admin = adminResponse[0];
  console.log("admin", admin);

  const createWhatsappTemplate = require("../data/communications/whatsapp/templates.js");
  const whatsappTemplate = createWhatsappTemplate({ instanceId: instance.id });
  const templateResponse = await knex("communications.whatsapp_templates")
    .insert(whatsappTemplate)
    .returning("*");
  const whatsappTemplateId = templateResponse[0].id;

  const people = await knex("people.people")
    .insert(
      generateSamplePeople({
        instance_id: instance.id,
        admin_point_person_id: admin.id,
      })
    )
    .returning("*");
  console.log("people", people);

  const emailTemplateResponse = await knex("communications.email_templates")
    .insert(
      generateEmailTemplate({
        instance_id: instance.id,
        instance_name: instance.name,
        instance_slug: instance.slug,
      })
    )
    .returning("*");
  const emailTemplate = emailTemplateResponse[0];
  console.log("emailTemplate", emailTemplate);

  const emailEventTemplateResponse = await knex(
    "communications.email_templates"
  )
    .insert(
      generateEventNotificationTemplates({
        instanceId: instance.id,
        instanceName: instance.name,
        instanceSlug: instance.slug,
      })
    )
    .returning("*");
  const emailEventTemplate = emailEventTemplateResponse[0];

  const templatesResponse = await knex("website.templates")
    .insert([
      generateHandlebarsPageTemplates.event({ instance_id: instance.id }),
      generatePageTemplates.detault_page_template({ instance_id: instance.id }),
      generateHandlebarsPageTemplates.petition({ instance_id: instance.id }),
    ])
    .returning("*");
  const eventTemplate = templatesResponse[0];
  const pageTemplate = templatesResponse[1];
  const petitionTemplate = templatesResponse[2];
  console.log("templatesResponse", eventTemplate, pageTemplate);

  //todo: make add heading etc to page template,
  //todo: make post template (with heading, post time, etc)...
  //todo: make post collection template and page collection type...

  const pageResponse = await knex("website.content_types")
    .insert({
      instance_id: instance.id,
      collection_template_id: pageTemplate.id,
      content_template_id: pageTemplate.id,
      name: "Pages",
      slug: "pages",
    })
    .returning("*");
  const postsResponse = await knex("website.content_types")
    .insert({
      instance_id: instance.id,
      collection_template_id: pageTemplate.id,
      content_template_id: pageTemplate.id,
      name: "Posts",
      slug: "posts",
    })
    .returning("*");
  const page = pageResponse[0];
  const post = postsResponse[0];
  const blocks = require("../data/blocks.js");
  await knex("website.blocks")
    .insert([
      { instance_id: instance.id, ...blocks.header() },
      { instance_id: instance.id, ...blocks.cta() },
      { instance_id: instance.id, ...blocks.footer() },
    ])
    .returning("*");
  const content = require("../data/content.js");
  await knex("website.content")
    .insert([
      {
        content_type_id: page.id,
        template_id: pageTemplate.id,
        ...content.page(),
      },
      {
        content_type_id: post.id,
        template_id: pageTemplate.id, //will be postTemplate maybe later
        ...content.post(),
      },
    ])
    .returning("*");

  await knex("instances")
    .update({
      settings: JSON.stringify({
        default_admin_id: admin.id,
        events: {
          default_template_id: eventTemplate.id,
          default_email_template_id: emailEventTemplate.id,
        },
        communications: {
          email: {
            default_from_name: `${instance.name} <${instance.slug}>@belcoda.com`,
            default_template_id: emailTemplate.id,
          },
          whatsapp: {
            default_template_id: whatsappTemplateId,
            phone_number_id: "0123456789", //replace these with real values or use env vars
            business_account_id: "0123456789", //replace these with real values or use env vars
          },
        },
        petitions: {
          default_template_id: petitionTemplate.id,
        },
        website: {
          default_template_id: pageTemplate.id,
          pages_content_type_id: page.id,
          posts_content_type_id: post.id,
        },
      }),
    })
    .where({ id: instance.id });
};
