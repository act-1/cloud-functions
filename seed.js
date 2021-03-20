const admin = require('firebase-admin');
const geofirestore = require('geofirestore');
const seed = require('./seed/seed-data');
const GeoSeed = require('./seed/geofirestore-documents');
const RealtimeSeed = require('./seed/realtime-data');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const app = admin.initializeApp({
  projectId: 'act1-dev',
  credential: admin.credential.applicationDefault(),
  databaseURL: 'http://localhost:9000/?ns=act1-dev-default-rtdb',
});

// Create a GeoFirestore reference
const GeoFirestore = geofirestore.initializeApp(app.firestore());

async function seedData() {
  try {
    const promises = Object.entries(seed).map((entry) => app.firestore().doc(entry[0]).set(entry[1]));
    await Promise.all(promises);

    // Seed geofirestore Documents
    const regionCollection = GeoFirestore.collection('regions');
    const regionSeedData = GeoSeed.regions.map((region) => regionCollection.doc(region.id).set(region));
    await Promise.all(regionSeedData);

    const eventCollection = GeoFirestore.collection('events');
    const eventSeedData = GeoSeed.events.map((event) => eventCollection.doc(event.id).set(event));
    await Promise.all(eventSeedData);

    const postsCollection = GeoFirestore.collection('posts');
    const postSeedData = GeoSeed.posts.map((post) => postsCollection.doc(post.id).set(post));
    await Promise.all(postSeedData);

    // Realtime Database seed
    // Locations nodes
    const RTDBLocations = Object.entries(RealtimeSeed.locations);
    const locationsPromises = RTDBLocations.map(([location, value]) =>
      admin.database().ref('locations').child(location).set(value)
    );
    await Promise.all(locationsPromises);

    console.log('🌱 Firestore data seeded successfuly.');
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

seedData();
