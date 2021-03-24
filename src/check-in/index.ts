import * as functions from 'firebase-functions';
import { firestore, database } from 'firebase-admin';

exports.onCheckIn = functions.firestore.document('checkIns/{docId}').onCreate(async (snap, context) => {
  try {
    const checkInData = snap.data();
    console.log(checkInData);
    const { locationId, locationRegion, eventId } = checkInData;

    // Update stats.

    await database().ref('locations').child(locationId).child('counter').set(database.ServerValue.increment(1));
    await database().ref('regions').child(locationRegion).child('counter').set(database.ServerValue.increment(1));
    await database().ref('totalCounter').set(database.ServerValue.increment(1));

    // Log for future stats
    await firestore()
      .collection('checkInLogger')
      .add({ locationId, locationRegion, createdAt: firestore.FieldValue.serverTimestamp(), eventId: eventId || null });
  } catch (err) {
    console.error(err);
    throw err;
  }
});

exports.onCheckInUpdate = functions.firestore.document('checkIns/{docId}').onUpdate(async (change) => {
  try {
    const before = change.before.data();
    const after = change.after.data();

    if (before.locationRegion !== after.locationRegion) {
      await database().ref('regions').child(before.locationRegion).child('counter').set(database.ServerValue.increment(-1));
      await database().ref('regions').child(after.locationRegion).child('counter').set(database.ServerValue.increment(1));
    }

    if (before.locationId !== after.locationId) {
      await database().ref('locations').child(before.locationId).child('counter').set(database.ServerValue.increment(-1));
      await database().ref('locations').child(after.locationId).child('counter').set(database.ServerValue.increment(1));

      // Log for future stats
      await firestore().collection('checkInLogger').add({
        locationId: after.locationId,
        locationRegion: after.locationRegion,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
});

exports.onCheckInDelete = functions.firestore.document('checkIns/{docId}').onDelete(async (snap) => {
  try {
    const checkInData = snap.data();

    await database().ref('locations').child(checkInData.locationId).child('counter').set(database.ServerValue.increment(-1));
    await database().ref('regions').child(checkInData.locationRegion).child('counter').set(database.ServerValue.increment(-1));
    await database().ref('totalCounter').set(database.ServerValue.increment(-1));
  } catch (err) {
    console.error(err);
    throw err;
  }
});

async function updateCheckInCount() {
  try {
    // Limiting to 500 documents because of batch commit limits.
    const checkInSnapshots = await firestore().collection('checkIns').where('expireAt', '<', new Date()).limit(500).get();

    // Remove check in documents.
    // The document's delete trigger event will handle counter updates.
    const batch = firestore().batch();
    checkInSnapshots.forEach((checkIn) => {
      batch.delete(checkIn.ref);
    });

    return batch.commit();
  } catch (err) {
    throw err;
  }
}

exports.updateCheckInCountManually = functions.https.onCall(async (data, context) => {
  try {
    return updateCheckInCount();
  } catch (err) {
    throw err;
  }
});

exports.updateCheckInCount = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  try {
    return updateCheckInCount();
  } catch (err) {
    console.error(err);
    throw err;
  }
});

/**
 * Retrieves all expired check ins, updates their isActive property and decrements their location.
 */
// async function updateCheckInCount() {
//   try {
//     const expiredCheckInsSnapshot = await firestore()
//       .collection('checkIns')
//       .where('expireAt', '<=', new Date())
//       .where('isActive', '==', true)
//       .get();

//     let checkInLocations = {};

//     // Create an object which contains the locationIds and their respective check ins.
//     expiredCheckInsSnapshot.docs.forEach((checkIn) => {
//       const { locationId, userId } = checkIn.data();
//       if (!checkInLocations[locationId]) {
//         checkInLocations[locationId] = [{ checkInId: checkIn.id, userId }];
//       } else {
//         checkInLocations[locationId].push({ checkInId: checkIn.id, userId });
//       }
//     });

//     const locationIds = Object.keys(checkInLocations);

//     const updateRequests = locationIds.map(async (locationId) => {
//       let expiredLocationCheckInCounter = 0;
//       const locationCheckIns = checkInLocations[locationId];

//       try {
//         // Take all check in for a location.

//         const batch = firestore().batch();

//         // Set isActive check in flag to false.
//         const checkInPromises = await locationCheckIns.map(async (checkIn) => {
//           const { checkInId, userId } = checkIn;

//           const checkInRef = firestore().collection(`checkIns`).doc(checkInId);

//           batch.update(checkInRef, { isActive: false, updatedAt: firestore.FieldValue.serverTimestamp() });

//           const publicCheckInRef = database().ref(`checkIns/${locationId}/${checkInId}`);

//           try {
//             const publicCheckInSnapshot = await publicCheckInRef.once('value');

//             if (publicCheckInSnapshot.exists()) {
//               await publicCheckInRef.update({ isActive: false, updatedAt: database.ServerValue.TIMESTAMP });
//             }
//           } catch (err) {
//             console.error(err);
//           }

//           expiredLocationCheckInCounter++;
//           console.log(`Check in activity ${checkInId} was set to off (pending batch commit).`);
//         });

//         // Wait for all check ins batch additions to finish
//         await Promise.all(checkInPromises);

//         // Commit check in firestore updates
//         await batch.commit();

//         // Decrement expired check ins from location counter.
//         const decrementCount = -expiredLocationCheckInCounter;
//         await database().ref('locationCounter').child(locationId).set(database.ServerValue.increment(decrementCount));

//         console.log(`Removed ${expiredLocationCheckInCounter} check ins from ${locationId}`);

//         return true;
//       } catch (err) {
//         console.error(err);
//         throw err;
//       }
//     });
//     await Promise.all(updateRequests);
//     await database().ref('currentCheckIns').set(database.ServerValue.increment(-expiredCheckInsSnapshot.docs.length));
//     console.log('Total check ins removed: ', expiredCheckInsSnapshot.docs.length);
//   } catch (err) {
//     throw err;
//   }
// }

// exports.updateCheckInCountManually = functions.https.onCall(async (data, context) => {
//   try {
//     if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');

//     const result = await updateCheckInCount();
//     return result;
//   } catch (err) {
//     throw err;
//   }
// });

// exports.updateCheckInCount = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
//   try {
//     await updateCheckInCount();
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// });
