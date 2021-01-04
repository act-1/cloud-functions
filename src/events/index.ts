import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

export const attendEvent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.eventId) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');
    if (!data.eventDate) throw new functions.https.HttpsError('invalid-argument', 'Missing Event ID.');

    const { uid: userId } = context.auth;
    const { eventId, eventDate } = data;

    const eventAttendRef = await firestore().collection('events').doc(eventId).collection('attending').doc(userId);
    const userAttendRef = await firestore().collection('users').doc(userId).collection('attendingEvents').doc(eventId);
    const userAttendDoc = await userAttendRef.get();

    if (!userAttendDoc.exists) {
      const batch = firestore().batch();

      // eventDate arrives JSON serialized - we need to convert it to firebase timestamp
      const eventTimestamp = new firestore.Timestamp(eventDate.seconds, eventDate.nanoseconds);

      // Create a user attending document
      batch.set(eventAttendRef, { notifications: true, attendedAt: firestore.FieldValue.serverTimestamp() });
      batch.set(userAttendRef, { eventDate: eventTimestamp, attendedAt: firestore.FieldValue.serverTimestamp() });

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

    const { uid: userId } = context.auth;
    const { eventId } = data;

    const eventAttendRef = await firestore().collection('events').doc(eventId).collection('attending').doc(userId);
    const userAttendRef = await firestore().collection('users').doc(userId).collection('attendingEvents').doc(eventId);
    const userAttendDoc = await userAttendRef.get();

    if (userAttendDoc.exists) {
      const batch = firestore().batch();

      // Create a user attending document
      batch.delete(eventAttendRef);
      batch.delete(userAttendRef);

      // Decrease the event attending counter
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

/**
 * The function fetches all past events which haven't been marked as "pastEvent", and mark them correctly.
 */
exports.updatePastEvents = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  try {
    const pastEventsSnapshot = await firestore()
      .collection('events')
      .where('pastEvent', '==', false)
      .where('endDate', '<=', new Date())
      .get();

    const updates = pastEventsSnapshot.docs.map((event) => event.ref.set({ pastEvent: true }));
    await Promise.all(updates);

    return true;
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
