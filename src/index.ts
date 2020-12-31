import * as admin from 'firebase-admin';

let databaseURL = 'https://act1co-default-rtdb.firebaseio.com/';

if (process.env.FUNCTIONS_EMULATOR) {
  databaseURL = 'http://localhost:9000/?ns=act1co';
}

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'act1co', databaseURL });

export * from './user';
export * from './events';
export * from './check-in';
export * from './feed';
