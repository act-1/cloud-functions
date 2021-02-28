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

    const updates = pastEventsSnapshot.docs.map((event) => event.ref.update({ status: 'past' }));
    await Promise.all(updates);

    return true;
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
