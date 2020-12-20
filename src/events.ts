import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const attendEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.eventId) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');
    if (!data.eventDate) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');

    const { uid } = context.auth;
    const { eventId, eventDate } = data;

    const attendingRef = await firestore().collection('users').doc(uid).collection('attendingEvents').doc(data.eventId);
    const attendingDoc = await attendingRef.get();

    if (!attendingDoc.exists) {
      const batch = firestore().batch();

      // Create a user attending document
      batch.set(attendingRef, { eventDate: eventDate, attendedAt: firestore.FieldValue.serverTimestamp() });

      // Increase the event attending counter
      const eventRef = firestore().collection('events').doc(eventId);
      batch.update(eventRef, { attendingCount: firestore.FieldValue.increment(1) });

      // Commit both changes atomically
      await batch.commit();

      return { ok: true };
    } else {
      throw new functions.https.HttpsError('already-exists', 'The user is already attending the event.');
    }
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
