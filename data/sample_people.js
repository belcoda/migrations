const br = require("../data/random_users/br.js");
const us = require("../data/random_users/us.js");

module.exports = function generateSamplePeople({
  instance_id,
  admin_point_person_id,
}) {
  const brazilianUsers = br.map((user, i) => {
    return {
      instance_id: instance_id,
      full_name: `${user.name.first} ${user.name.last}`,
      given_name: user.name.first,
      family_name: user.name.last,
      preferred_language: "en",
      address_line_1:
        user.location.street.number + " " + user.location.street.name,
      postcode: user.location.postcode,
      locality: user.location.city,
      state: user.location.state,
      country: "us",
      email: {
        email: user.email,
        subscribed: true,
        contactable: true,
      },
      //phone numbers are tricky because our parsing library doesn't allow fakies
      /* phone_number: {
        phone_number: `+1${us[i].cell.replace(/[\s()-]/g, "")}`,
        contactable: true,
        textable: true,
        country: "us",
      }, */
      point_person_id: admin_point_person_id,
    };
  });

  return [...brazilianUsers];
};
