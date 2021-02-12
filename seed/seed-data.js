const { firestore } = require('firebase-admin');

const now = new Date();
const before1Hour = new Date();
before1Hour.setHours(now.getHours() + 5);

module.exports = {
  'organizations/kumiiisrael': {
    id: 'kumi',
    name: 'קומי ישראל',
    profilePicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
  },
  'organizations/crime-minister': {
    id: 'crime-minister',
    name: 'Crime Minister',
    profilePicture:
      'https://res.cloudinary.com/onekm/image/upload/c_scale,w_300/v1608279410/organizers/crime-minister_alpxwz.png',
  },
};
