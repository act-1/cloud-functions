import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const userCheckIn = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  if (!data.locationId) throw new functions.https.HttpsError('invalid-argument', 'Missing location ID.');

  const { uid: userId } = context.auth;

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

  // const lastUserCheckInDoc = await lastUserCheckInRef.get();
  // if (lastUserCheckInDoc.)
  // if ()

  // check if eventId was supplied
  // check the end time of the event, and set it as the check in timeout

  // add the check in to firestore:
  // userId, userInfo, locationId, locationInfo, eventId

  // Add the check in to the user's checkInHistory
  //
});
