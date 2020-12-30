import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const userCheckIn = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.locationId) throw new functions.https.HttpsError('invalid-argument', 'Missing location ID.');

    const { uid: userId } = context.auth;
    const { locationId, eventId } = data;

    // Check if the user doesn't have an active check in
    const lastCheckInSnapshot = await firestore()
      .collection(`users/${userId}/checkIns`)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    const checkInDocs = lastCheckInSnapshot.docs;

    // Ensure the user checked in in the past.
    // If no documents were received, it means this is the first time the user's checking in and we can avoid this check.
    if (checkInDocs.length === 1) {
      if (checkInDocs[0].data().isActive) {
        throw 'The user has an active check in session.';
      }
    }

    // 1.5 hours from now - the default check in expiration time.
    let expireAt = new Date();
    expireAt.setTime(expireAt.getTime() + 1.5 * 60 * 60 * 1000);

    // Check if the user checks in to an event.
    // If they do - set the expiration time to the event end time.
    let eventRef = null;
    if (eventId) {
      eventRef = firestore().collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      if (!eventDoc.exists) throw 'The event does not exist.';
      expireAt = eventDoc.data().endTime;
    }

    const location = await firestore().collection('locations').doc(locationId).get();
    if (!location.exists) throw 'The location does not exist.';
    const locationDoc = location.data();

    const checkInInfo = {
      userId,
      locationId,
      locationName: locationDoc.name,
      locationCity: locationDoc.city,
      createdAt: firestore.FieldValue.serverTimestamp(),
      expireAt,
    };

    // Create check in documents

    const checkInRef = await firestore()
      .collection('checkIns')
      .add({ ...checkInInfo, isActive: true });

    const batch = firestore().batch();

    const userCheckInRef = firestore().collection(`users/${userId}/checkIns`).doc(checkInRef.id);
    batch.set(userCheckInRef, { ...checkInInfo, isActive: true, id: checkInRef.id });

    if (eventRef) {
      const eventCheckInRef = firestore().collection(`events/${eventId}/checkIns`).doc(checkInRef.id);
      batch.set(eventCheckInRef, { ...checkInInfo, id: checkInRef.id });
    }

    await batch.commit();

    return { ok: true };
    // Increment check in realtime database counter
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
