const admin = require('firebase-admin');
const geofirestore = require('geofirestore');
const seed = require('./seed-data');
const GeoSeed = require('./seed/geofirestore-documents');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const app = admin.initializeApp({
  projectId: 'act1co',
  credential: admin.credential.applicationDefault(),
});

// Create a GeoFirestore reference
const GeoFirestore = geofirestore.initializeApp(app.firestore());

async function seedData() {
  try {
    const promises = Object.entries(seed).map((entry) => app.firestore().doc(entry[0]).set(entry[1]));
    await Promise.all(promises);

    // Seed geofirestore Documents
    const locationCollection = GeoFirestore.collection('locations');
    const locationSeedData = GeoSeed.locations.map(({ lat, lng, ...location }) =>
      locationCollection.doc(location.id).set({ ...location, coordinates: new admin.firestore.GeoPoint(lat, lng) })
    );
    await Promise.all(locationSeedData);

    console.log('🌱 Firestore data seeded successfuly.');
  } catch (err) {
    console.error(err);
  }
}

seedData();