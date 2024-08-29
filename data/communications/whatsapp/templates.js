module.exports = function ({ instanceId }) {
  return [
    {
      instance_id: instanceId,
      name: "Test template",
      status: "APPROVED",
      interactive: false,
      message: {
        name: "hello_world",
        category: "MARKETING",
        allow_category_change: true,
        language: "en",
        components: [
          /*{
          type: "HEADER",
          format: "TEXT",
          text: "Please make sure this template works",
        }, */
          {
            type: "BODY",
            format: "TEXT",
            text: "Hello, {{1}}",
            example: {
              body_text: [["world"]],
            },
          },
          /* {
          type: "FOOTER",
          text: "Thanks!",
        }, */
          /* {
          type: "BUTTONS",
          buttons: [
            {
              type: "PHONE_NUMBER",
              text: "Call now",
              phone_number: "+1234567890",
            },
            {
              type: "URL",
              text: "Visit our site",
              url: "https://example.com",
            },
            {
              type: "QUICK_REPLY",
              text: "Quick reply",
            },
          ],
        }, */
        ],
      },
    },
    {
      instance_id: instanceId,
      name: "Invitation",
      status: "APPROVED",
      interactive: true,
      message: {
        name: "bc_generic_event_invitation",
        category: "MARKETING",
        allow_category_change: true,
        language: "en",
        components: [
          {
            type: "HEADER",
            format: "TEXT",
            text: "{{1}} - you're invited!",
          },
          {
            type: "BODY",
            format: "TEXT",
            text: `Hi {{1}}, did you hear about {{2}}? It's {{3}} at {{4}}.

Do you want more details?`,
            example: {
              body_text: [["Andy", "the event", "happening", "5pm"]],
            },
          },
          {
            type: "BUTTONS",
            buttons: [
              {
                type: "QUICK_REPLY",
                text: "Tell me more",
              },
            ],
          },
        ],
      },
    },
    {
      instance_id: instanceId,
      name: "Free response",
      status: "APPROVED",
      interactive: false,
      message: {
        name: "bc_generic_free_response",
        category: "MARKETING",
        allow_category_change: true,
        language: "en",
        components: [
          {
            type: "BODY",
            format: "TEXT",
            text: `Hello, do you have a second to talk about {{1}}? I just have a couple of questions regarding {{2}}`,
            example: {
              body_text: [["issues that concern you", "climate change"]],
            },
          },
        ],
      },
    },
  ];
};
