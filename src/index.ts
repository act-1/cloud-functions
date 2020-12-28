import * as admin from 'firebase-admin';

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'act1co' });

export * from './events';
export * from './user';
