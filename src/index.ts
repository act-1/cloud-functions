import * as admin from 'firebase-admin';

let databaseURL = 'https://act1co-default-rtdb.firebaseio.com/';
let projectId = 'act1co';

if (process.env.FUNCTIONS_EMULATOR) {
  databaseURL = 'https://act1-dev-default-rtdb.firebaseio.com/';
  projectId = 'act1-dev';
}

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId, databaseURL });

export * from './user';
export * from './events';
export * from './check-in';
export * from './feed';
