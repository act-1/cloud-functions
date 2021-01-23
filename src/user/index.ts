import * as functions from 'firebase-functions';
import { firestore, storage } from 'firebase-admin';

export const onUserCreation = functions.auth.user().onCreate(async (user) => {
  const isAnonymous = user.providerData.length === 0;
  let displayName = 'אנונימי/ת';
  let profilePicture =
    'https://res.cloudinary.com/act1/image/upload/v1610881280/profile_pictures/account-placeholder.png';

  if (!isAnonymous) {
    displayName = user.providerData[0].displayName || displayName;
  }

  const { providerId } = user.providerData[0];

  if (providerId === 'google.com') {
  }

  try {
    const userRef = firestore().collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const result = await userRef.set({
        id: userDoc.id,
        isAnonymous,
        displayName,
        profilePicture,
        signupCompleted: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      return result;
    }
    throw 'User already exists.';
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});

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
      throw new functions.https.HttpsError('already-exists', 'The FCM token already exists.');
    }
  } catch (err) {
    throw err;
  }
});
