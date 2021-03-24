const admin = require('firebase-admin');

const app = admin.initializeApp({
  projectId: 'act1-dev',
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://act1-dev-default-rtdb.firebaseio.com/',
});

async function migrate() {
  try {
    const locations = await app.firestore().collection('locations').get();
    const promises = locations.docs.map((doc) => {
      return new Promise((resolve, reject) => {
        const locationData = doc.data();

        app
          .database()
          .ref('locations')
          .child(locationData.id)
          .get()
          .then(async (snapshot) => {
            if (!snapshot.exists()) {
              const node = await app.database().ref('locations').child(locationData.id).set({
                id: locationData.id,
                region: locationData.region,
                name: locationData.name,
                city: locationData.city,
                latitude: locationData.coordinates._latitude,
                longitude: locationData.coordinates._longitude,
              });
              resolve(node);
            } else {
              resolve(null);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
    await Promise.all(promises);
    console.log(promises);
    console.log('🥰 Migrated successfuly.');
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

migrate();
