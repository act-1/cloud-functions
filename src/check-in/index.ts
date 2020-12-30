import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const userCheckIn = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  if (!data.locationId) throw new functions.https.HttpsError('invalid-argument', 'Missing location ID.');

  const { uid: userId } = context.auth;
  const { locationId, eventId } = context.data;

  // Check if the user doesn't have an active check in
  const lastCheckInSnapshot = await firestore()
    .collection(`users/${userId}/checkInHistory`)
    .orderBy('date', 'desc')
    .limit(1)
    .get();
  const checkInDocs = lastCheckInSnapshot.docs;

  // If no documents received, it means this is the first time the user is checking in and we can avoid this check.
  if (checkInDocs.length === 1) {
    if (checkInDocs[0].data().isActive) {
      throw 'The user has an active check in session.';
    }
  }

  // 1.5 Hours from now - the default check in expiration time.
  let expireTime = new Date();
  expireTime.setTime(expireTime.getTime() + 1.5 * 60 * 60 * 1000);

  // Check if the user checks in to an event.
  // If they does, set the expiration time to the event end time.
  if (eventId) {
    const eventDoc = await firestore().collection('events').doc(eventId).get();
    if (!eventDoc.exists) throw 'The event does not exist.';
    expireTime = eventDoc.data().endTime;
  }

  // add the check in to firestore:
  // userId, userInfo, locationId, locationInfo, eventId

  // Add the check in to the user's checkInHistory
  //
});
