import * as functions from 'firebase-functions';
import { firestore, database } from 'firebase-admin';

/**
 * Retrieves all expired check ins, updates their isActive property and decrements their location.
 */
async function updateCheckInCount() {
  try {
    const expiredCheckInsSnapshot = await firestore()
      .collection('checkIns')
      .where('expireAt', '<=', new Date())
      .where('isActive', '==', true)
      .get();

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
          const userCheckInRef = firestore().collection(`users/${userId}/checkIns`).doc(checkInId);

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

exports.updateCheckInCount = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  updateCheckInCount();
});
