const fs = require('fs');

module.exports = function ({instanceId, instanceName, instanceSlug}) {
  return {
      instance_id: instanceId,
      name: "Event reminder template",
      from: `${instanceName} <${instanceSlug}@belcoda.com>`,
      reply_to: `${instanceSlug}@belcoda.com`,
      subject: "{{event.name}}",
      preview_text: "{{event.name}}",
      html: fs.readFileSync('./data/templates/event_notification_template.handlebars', 'utf8').toString(),
      text: fs.readFileSync('./data/templates/event_notification_template.txt', 'utf8').toString(),
  }
}