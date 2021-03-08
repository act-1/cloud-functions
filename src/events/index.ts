import * as functions from 'firebase-functions';
import { messaging, firestore } from 'firebase-admin';

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

    const batch = firestore().batch();

    const updates = pastEventsSnapshot.docs.map(async (event) => {
      try {
        // Get the event's protesters count
        const checkInsSnapshot = await firestore().collection('checkIns').where('eventId', '==', event.id).get();
        const protestersCount = checkInsSnapshot.docs.length;

        // Update all checkIn docs with the protesters count
        const checkInUpdates = checkInsSnapshot.docs.map((checkInDoc) => checkInDoc.ref.update({ protestersCount }));
        await Promise.all(checkInUpdates);

        batch.update(event.ref, { status: 'past', protestersCount });
      } catch (err) {
        throw err;
      }
    });

    await Promise.all(updates);
    await batch.commit();

    return true;
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});

// TODO: Limit to admin only
exports.sendEventAttendeesNotification = functions.https.onCall(async (data, context) => {
  try {
    const imageUrl = data.imageUrl || undefined;

    // Notification details.
    // const messageBase = {
    //   notification: {
    //     title: data.title,
    //     body: data.body,
    //     sound: 'default',
    //   },
    //   android: { priority: 'high', notification: { image } },
    //   apns: { payload: { aps: { 'mutable-content': 1 } }, fcm_options: { image } },
    // };

    // Get the event's attending list
    const attendingSnapshot = await firestore()
      .collection('events')
      .doc('habimba-protest')
      .collection('attending')
      .get();

    const messages = attendingSnapshot.docs
      .map((a) => a.data())
      .filter((a) => a.notifications === true)
      .map((a) => {
        return messaging().send({
          notification: {
            title: data.title,
            body: data.body,
          },
          android: { priority: 'high', notification: { imageUrl, sound: 'default' } },
          apns: { payload: { aps: { 'mutable-content': 1 } }, fcmOptions: { imageUrl } },
          token: a.fcmToken,
        });
      });

    return Promise.all(messages);
    // Send notifications to all tokens.
    // return messaging().sendToDevice(tokens, payload);

    // For each message check if there was an error.
    // const tokensToRemove = [];
    // response.results.forEach((result, index) => {
    //   const error = result.error;
    //   if (error) {
    //     console.error('Failure sending notification to', tokens[index], error);
    //     // Cleanup the tokens who are not registered anymore.
    //     if (
    //       error.code === 'messaging/invalid-registration-token' ||
    //       error.code === 'messaging/registration-token-not-registered'
    //     ) {
    //       tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
    //     }
    //   }
    // });
    // return Promise.all(tokensToRemove);
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
