import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { event } from 'firebase-functions/lib/providers/analytics';

export const calc = functions.https.onCall((data, context) => {
  return { sum: data.a + data.b };
});

export const attendEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.eventId) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');
    if (!data.eventDate) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');

    const { uid } = context.auth;
    const { eventId, eventDate } = data;

    const attendingRef = await firestore().collection('users').doc(uid).collection('attendingEvents').doc(eventId);
    const attendingDoc = await attendingRef.get();

    if (!attendingDoc.exists) {
      const batch = firestore().batch();

      // eventDate arrives JSON serialized - we need to convert it to firebase timestamp
      const eventTimestamp = new firestore.Timestamp(eventDate._seconds, eventDate._nanoseconds);

      // Create a user attending document
      batch.set(attendingRef, { eventDate: eventTimestamp, attendedAt: firestore.FieldValue.serverTimestamp() });

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

export const unattendEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.eventId) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');

    const { uid } = context.auth;
    const { eventId } = data;

    const attendingRef = await firestore().collection('users').doc(uid).collection('attendingEvents').doc(eventId);
    const attendingDoc = await attendingRef.get();

    if (attendingDoc.exists) {
      const batch = firestore().batch();

      // Create a user attending document
      batch.delete(attendingRef);

      // Increase the event attending counter
      const eventRef = firestore().collection('events').doc(eventId);
      batch.update(eventRef, { attendingCount: firestore.FieldValue.increment(-1) });

      // Commit both changes atomically
      await batch.commit();

      return { ok: true };
    } else {
      throw new functions.https.HttpsError('not-found', 'The user is not attending the event.');
    }
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
