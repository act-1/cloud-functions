import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

/**
 * The function fetches all past events and set their status correctly.
 */
exports.updatePastEvents = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  try {
    const pastEventsSnapshot = await firestore()
      .collection('events')
      .where('status', '==', 'upcoming')
      .where('endDate', '<', new Date())
      .get();

    // Sum up protesters count and update event status
    const updates = pastEventsSnapshot.docs.map(async (event) => {
      const snapshot = await firestore().collection('checkInLogger').where('eventId', '==', event.id).get();
      return event.ref.update({ status: 'past', protestersCount: snapshot.docs.length });
    });

    await Promise.all(updates);

    return true;
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
