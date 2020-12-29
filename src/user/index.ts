import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const createUserFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  if (!data.fcmToken) throw new functions.https.HttpsError('invalid-argument', 'Missing token.');
  if (!data.deviceId) throw new functions.https.HttpsError('invalid-argument', 'Missing device Id.');

  const { uid: userId } = context.auth;
  const { fcmToken, deviceId, deviceName } = data;

  try {
    const fcmTokenRef = firestore().collection(`users/${userId}/devices`).doc(fcmToken);
    const fcmTokenDoc = await fcmTokenRef.get();

    if (!fcmTokenDoc.exists) {
      await fcmTokenRef.set({
        id: fcmToken,
        deviceId,
        deviceName,
        userId,
        active: true,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return { created: true };
    } else {
      throw 'The FCM token already exists.';
    }
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
