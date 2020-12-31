import * as functions from 'firebase-functions';
import { firestore, database } from 'firebase-admin';

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
    if (eventId) {
      const eventRef = firestore().collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      if (!eventDoc.exists) throw new functions.https.HttpsError('not-found', 'The event does not exist.');
      expireAt = eventDoc.data().endTime;
    }

    const location = await firestore().collection('locations').doc(locationId).get();
    if (!location.exists) throw new functions.https.HttpsError('not-found', 'The location does not exist.');
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
    const checkInRef = firestore().collection('checkIns').doc();
    const userCheckInRef = firestore().collection(`users/${userId}/checkIns`).doc(checkInRef.id);

    const batch = firestore().batch();
    batch.set(checkInRef, { ...checkInInfo, isActive: true });
    batch.set(userCheckInRef, { ...checkInInfo, isActive: true, id: checkInRef.id });
    await batch.commit();

    // Increment the location counter in the realtime database.
    await database().ref(`locationCounter/${locationId}`).set(database.ServerValue.increment(1));

    return { ok: true };
    // Increment check in realtime database counter.
  } catch (err) {
    throw err;
  }
});

/**
 * Retrieves all expired check ins, updates their isActive property and decrements their location.
 */
async function updateCheckInCount() {
  try {
    const expiredCheckInsSnapshot = await firestore().collection('checkIns').where('expiresAt', '<=', new Date()).get();

    let checkInLocations = {};

    // Create an object which contains the locationIds and their respective check ins.
    expiredCheckInsSnapshot.docs.forEach((checkIn) => {
      const { locationId, userId } = checkIn.data();
      if (!checkInLocations[locationId]) {
        checkInLocations[locationId] = [{ checkInId: checkIn.id, userId }];
      } else {
        checkInLocations[locationId].push({ checkInId: checkIn.id, userId });
      }
    });

    let documentCount = 0;

    const locationIds = Object.keys(checkInLocations);

    locationIds.map(async (locationId) => {
      try {
        // Take all check in for a location.
        const locationCheckIns = checkInLocations[locationId];

        const batch = firestore().batch();
        let expiredLocationCheckInCounter = 0;

        // Set isActive check in flag to false on both check in & user collections.
        locationCheckIns.forEach((checkIn) => {
          const { checkInId, userId } = checkIn;

          const checkInRef = firestore().collection(`checkIns`).doc(checkInId);
          const userCheckInRef = firestore().collection(`users/${userId}`).doc(checkInId);

          batch.update(checkInRef, { isActive: false, updatedAt: firestore.FieldValue.serverTimestamp() });
          batch.update(userCheckInRef, { isActive: false, updatedAt: firestore.FieldValue.serverTimestamp() });

          expiredLocationCheckInCounter++;
        });

        await batch.commit();

        // Decrement expired check ins from location counter.
        await database()
          .ref(`locationCounter/${locationId}`)
          .set(database.ServerValue.increment(-expiredLocationCheckInCounter));

        return true;
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    throw err;
  }
}

exports.updateCheckInCountManually = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    return await updateCheckInCount();
  } catch (err) {
    throw err;
  }
});

exports.updateCheckInCount = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
  updateCheckInCount();
});
