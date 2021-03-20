import * as functions from 'firebase-functions';
import admin, { database, firestore } from 'firebase-admin';

const bucket = admin.storage().bucket();

/**
 * Adds the user like to the post's like subcollection & the user's like list, and increments the post's like counter.
 * @param data.postId - The post Id to add a like to.
 */
export const likePost = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.postId) throw new functions.https.HttpsError('invalid-argument', 'Missing Post ID.');

    const { uid: userId } = context.auth;
    const { postId } = data;

    const postRef = firestore().collection('posts').doc(postId);
    const postLikeRef = firestore().collection(`posts/${postId}/likes`).doc(userId);
    const userPostLikeRef = firestore().collection(`users/${userId}/likes`).doc(postId);

    await firestore().runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      const postLikeDoc = await transaction.get(postLikeRef);

      if (!postDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Post does not exist.');
      }

      if (postLikeDoc.exists) {
        throw new functions.https.HttpsError('invalid-argument', 'The user has already liked the post.');
      }

      const postData = postDoc.data()!;
      const likeCounter = postData.likeCounter + 1;
      await transaction.update(postRef, { likeCounter });
      await transaction.set(postLikeRef, { createdAt: firestore.FieldValue.serverTimestamp() });
      await transaction.set(userPostLikeRef, { createdAt: firestore.FieldValue.serverTimestamp() });
    });

    return { ok: true, action: 'like' };
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});

/**
 * Adds the user like to the post's like subcollection & the user's like list, and increments the post's like counter.
 * @param data.postId - The post Id to add a like to.
 */
export const unlikePost = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
    if (!data.postId) throw new functions.https.HttpsError('invalid-argument', 'Missing Post ID.');

    const { uid: userId } = context.auth;
    const { postId } = data;

    const postRef = firestore().collection('posts').doc(postId);
    const postLikeRef = firestore().collection(`posts/${postId}/likes`).doc(userId);
    const userPostLikeRef = firestore().collection(`users/${userId}/likes`).doc(postId);

    await firestore().runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      const postLikeDoc = await transaction.get(postLikeRef);

      if (!postDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Post does not exist.');
      }

      if (!postLikeDoc.exists) {
        throw new functions.https.HttpsError('invalid-argument', 'User like does not exist.');
      }

      const postData = postDoc.data()!;
      const likeCounter = postData.likeCounter - 1;
      await transaction.update(postRef, { likeCounter });
      await transaction.delete(postLikeRef);
      await transaction.delete(userPostLikeRef);
    });

    return { updated: true, action: 'unlike' };
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});

export const onPostCreatin = functions.firestore.document('posts/{postId}').onCreate(async (snap, context) => {
  const postData = snap.data();
  if (postData.type === 'picture' && postData.locationId) {
    // Add to realtime location node
    const locationRef = database().ref('locations').child(postData.locationId).child('recentPictures');

    locationRef.once('value', (snapshot) => {
      const recentPictures = snapshot.val();
      if (!recentPictures) return snapshot.ref.set([{ postData }]);
      return snapshot.ref.set([{ postData }, ...recentPictures.slice(0, 2)]);
    });
  }
});

/** Delete post trigger.
 *  If the post is of type `picture`, we remove the `picture` document and the storaged file.
 */
export const onPostDeletion = functions.firestore.document('posts/{postId}').onDelete(async (snap, context) => {
  try {
    const postData = snap.data();

    if (postData.type === 'picture') {
      console.log(`Trying to delete a picture post by userId ${postData.authorId}.`);
      const pictureRef = firestore().collection('pictures').doc(postData.pictureId);

      const pictureSnapshot = await pictureRef.get();

      if (pictureSnapshot.exists) {
        const { storagePath } = pictureSnapshot.data();

        await bucket.file(storagePath).delete();
        await pictureRef.delete();

        console.log(`A picture post by userId ${postData.authorId} has been deleted.`, postData);
      } else {
        console.log(postData);
        throw new Error(`The picture document ${postData.pictureId} does not exist.`);
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
});
