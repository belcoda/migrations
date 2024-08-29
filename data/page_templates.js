function detault_page_template({instance_id}) {
  return {
    instance_id: instance_id,
    name: "Page template",
    html: `{{> blocks.header }}
<div class="container mx-auto px-4 antialiased prose">
<h1>{{{content.heading}}}</h1>
<div>
{{{content.html}}}
</div>
</div>
{{> blocks.cta }}
{{> blocks.footer }}`,
  };
}

const fs = require('fs');

function default_event_template({instance_id}) {
  return {
    instance_id: instance_id,
    name: "Event template",
    html: ` <div class="px-8 lg:px-12">
<main class="container mx-auto">
  <section class="mt-20">
    <h1 class="font-extrabold text-6xl text-gray-900">{{event.heading}}</h1>
  </section>
  <section class="grid grid-cols-12 gap-4 lg:gap-8 mt-6">
    <div class="col-span-12 md:col-span-6 lg:col-span-8 xl:col-span-9 grid grid-cols-1 gap-4">
      <!--event.feature_image_url-->
      <img src="https://i.ibb.co/gScwkkD/aj-colores-fy-IPhvav-IBs-unsplash-1-1.jpg" alt="{{event.feature_image_alt}}" class="w-full" />
      <h3 class="font-bold text-lg lg:text-xl xl:text-2xl text-gray-700">{{{event.lede}}}</h3>
      <p class="text-gray-600 lg:text-lg xl:text-xl">{{{event.body}}}</p>
    </div>
    <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 bg-gray-900 p-4 lg:p6 xl:p-8 text-white grid grid-cols-1">
      {{#if status.success}}
      <h2 class="text-xl xl:text-2xl font-bold">{{event.thank_you_title}}</h2>
      <p class="italic text-lg">{{event.thank_you_description}}</p>
      {{else}}
      <div>Starts: {{time event.starts_at}} {{date event.starts_at}}</div>
      <div>Ends: {{time event.ends_at}} {{date event.ends_at}}</div>
        <form method="post" class="space-y-2">
          {{#if event.request_name}}<div>
            <div class="mb-1 text-xs uppercase tracking-wider">Name</div>
            <div><input
              {{#if event.require_name}} required {{/if}} 
                type='text'
                name="name"
                class="block w-full placeholder-gray-500 px-2 py-1 text-md border-2 border-white text-gray-700 rounded" >
            </div>
          </div>{{/if}}
          {{#if event.request_postcode}}<div>
            <div class="mb-1 text-xs uppercase tracking-wider">Postcode</div>
            <div><input
              {{#if event.require_postcode}} required {{/if}} 
                type='text'
                name="postcode"
                class="block w-full placeholder-gray-500 px-2 py-1 text-md border-2 border-white text-gray-700 rounded" >
            </div>
          </div>{{/if}}
          {{#if event.request_address}}<div>
            <div class="mb-1 text-xs uppercase tracking-wider">Address</div>
            <div><input
              {{#if event.require_address}} required {{/if}} 
                type='text'
                name="address"
                class="block w-full placeholder-gray-500 px-2 py-1 text-md border-2 border-white text-gray-700 rounded" >
            </div>
          </div>{{/if}}
          {{#if event.request_email}}<div>
            <div class="mb-1 text-xs uppercase tracking-wider">Email</div>
            <div><input
              {{#if event.require_email}} required {{/if}} 
                type='email'
                name="email"
                class="block w-full placeholder-gray-500 px-2 py-1 text-md border-2 border-white text-gray-700 rounded" >
            </div>
          </div>{{/if}}
          {{#if event.request_phone_number}}<div>
            <div class="mb-1 text-xs uppercase tracking-wider">Phone number</div>
            <div><input
              {{#if event.require_phone_number}} required {{/if}} 
                type='text'
                name="phone_number"
                class="block w-full placeholder-gray-500 px-2 py-1 text-md border-2 border-white text-gray-700 rounded" >
            </div>
          </div>{{/if}}

          {{#if event.request_whatsapp}}<div>
            <div class="mb-1 text-xs uppercase tracking-wider">WhatsApp ID</div>
            <div><input
              {{#if event.require_whatsapp}} required {{/if}} 
                type='text'
                name="whatsapp"
                class="block w-full placeholder-gray-500 px-2 py-1 text-md border-2 border-white text-gray-700 rounded" >
            </div>
          </div>{{/if}}

          {{#if event.request_opt_in}}
          <div class="col-span-9 mt-4">
            <label class="flex items-center">
              <input type="checkbox" name="opt_in" class="form-checkbox w-5 h-5 rounded text-red-500" checked="{{event.default_opt_in}}" {{#if event.require_opt_in}} required {{/if}}>
              <span class="ml-2 text-lg">I want to receive updates about this and other campaigns</span>
            </label>
          </div>
          {{/if}}

          <button role="submit" class="bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded py-1 px-4 text-center">Sign up</button>
        </form>
      {{/if}}
    </div>
  </section>

</main>
</div>
{{> blocks.footer }}`,
  };
}


module.exports = {
  detault_page_template,
  default_event_template
}