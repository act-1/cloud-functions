import * as functions from 'firebase-functions';
import { firestore, database } from 'firebase-admin';

exports.onCheckIn = functions.firestore.document('checkIns/{docId}').onCreate(async (snap, context) => {
  try {
    const checkInData = snap.data();

    const { id: checkInId, locationId, userId, displayName, privacySetting, eventId } = checkInData;

    // Update stats.
    await database().ref('locationCounter').child(locationId).set(database.ServerValue.increment(1));
    await database().ref('currentCheckIns').set(database.ServerValue.increment(1));

    /**
     * Privacy settings:
     * PUBLIC - Add a check in entry to the location's RTDB ref and to the user's firestore document.
     * PRIVATE - Add the check in entry to the user's firestore document.
     * ANONYMOUS - Don't do anything, only increment the stats (above).
     */

    if (privacySetting === 'PUBLIC') {
      await database().ref(`checkIns/${locationId}/${checkInId}`).set({
        createdAt: database.ServerValue.TIMESTAMP,
        isActive: true,
        profilePicture: checkInData.profilePicture,
      });

      // Add user to the chat room.
      // Only allowed for events; not available for location check ins.
      if (eventId) {
        await database().ref(`chat/rooms/${eventId}/members/${userId}`).set({ displayName });
      }

      await firestore().collection(`users/${userId}/checkIns`).doc(checkInId).set(checkInData);
    }

    if (privacySetting === 'PRIVATE') {
      await firestore().collection(`users/${userId}/checkIns`).doc(checkInId).set(checkInData);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
});

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

    const locationIds = Object.keys(checkInLocations);

    const updateRequests = locationIds.map(async (locationId) => {
      let expiredLocationCheckInCounter = 0;
      const locationCheckIns = checkInLocations[locationId];

      try {
        // Take all check in for a location.

        const batch = firestore().batch();

        // Set isActive check in flag to false on both check in & user collections.
        const checkInPromises = await locationCheckIns.map(async (checkIn) => {
          const { checkInId, userId } = checkIn;

          const checkInRef = firestore().collection(`checkIns`).doc(checkInId);
          const userCheckInRef = firestore().collection(`users/${userId}/checkIns`).doc(checkInId);

          batch.update(checkInRef, { isActive: false, updatedAt: firestore.FieldValue.serverTimestamp() });
          batch.update(userCheckInRef, { isActive: false, updatedAt: firestore.FieldValue.serverTimestamp() });

          const publicCheckInRef = database().ref(`checkIns/${locationId}/${checkInId}`);

          try {
            const publicCheckInSnapshot = await publicCheckInRef.once('value');

            if (publicCheckInSnapshot.exists()) {
              await publicCheckInRef.update({ isActive: false, updatedAt: database.ServerValue.TIMESTAMP });
            }
          } catch (err) {
            console.error(err);
          }

          expiredLocationCheckInCounter++;
          console.log(`Check in activity ${checkInId} was set to off (pending batch commit).`);
        });

        // Wait for all check ins batch additions to finish
        await Promise.all(checkInPromises);

        // Commit check in firestore updates
        await batch.commit();

        // Decrement expired check ins from location counter.
        const decrementCount = -expiredLocationCheckInCounter;
        await database().ref('locationCounter').child(locationId).set(database.ServerValue.increment(decrementCount));

        console.log(`Removed ${expiredLocationCheckInCounter} check ins from ${locationId}`);

        return true;
      } catch (err) {
        console.error(err);
        throw err;
      }
    });
    await Promise.all(updateRequests);
    await database().ref('currentCheckIns').set(database.ServerValue.increment(-expiredCheckInsSnapshot.docs.length));
    console.log('Total check ins removed: ', expiredCheckInsSnapshot.docs.length);
  } catch (err) {
    throw err;
  }
}

exports.updateCheckInCountManually = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');

    const result = await updateCheckInCount();
    return result;
  } catch (err) {
    throw err;
  }
});

exports.updateCheckInCount = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  try {
    await updateCheckInCount();
  } catch (err) {
    console.error(err);
    throw err;
  }
});
