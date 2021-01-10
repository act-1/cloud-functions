import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

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

    const updates = pastEventsSnapshot.docs.map((event) => event.ref.update({ pastEvent: true }));
    await Promise.all(updates);

    return true;
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
