import * as admin from 'firebase-admin';

let databaseURL = 'https://act1co-default-rtdb.firebaseio.com/';
let projectId = 'act1co';
let storageBucket = ''; // TODO: ADD

if (true) {
  databaseURL = 'https://act1-dev-default-rtdb.firebaseio.com/';
  projectId = 'act1-dev';
  storageBucket = 'gs://act1-dev.appspot.com';
}

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId, databaseURL, storageBucket });

export * from './user';
export * from './events';
export * from './check-in';
export * from './feed';
export * from './chat';
