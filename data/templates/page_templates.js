const fs = require('fs');

module.exports = {
  petition: function({instance_id}) {
    return {
      instance_id, 
      name: "Petition template",
      html: fs.readFileSync('./data/templates/petition_page_template.handlebars', 'utf8').toString(),
    }
  }, 
  event: function({instance_id}) {
    return {
      instance_id, 
      name: "Event template",
      html: fs.readFileSync('./data/templates/event_page_template.handlebars', 'utf8').toString(),
    }
  }
  }