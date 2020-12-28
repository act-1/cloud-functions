import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

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

    const likeRef = firestore().collection(`posts/${postId}/likes`).doc(userId);
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
      throw new functions.https.HttpsError('already-exists', 'Already liked post.');
    }

    const postRef = firestore().collection('posts').doc(postId);
    const userRef = firestore().collection(`users/${userId}/likes`).doc(postId);

    const batch = firestore().batch();
    batch.update(postRef, { likeCounter: firestore.FieldValue.increment(1) });
    batch.set(likeRef, { createdAt: firestore.FieldValue.serverTimestamp() });
    // Add the post content here:
    batch.set(userRef, { createdAt: firestore.FieldValue.serverTimestamp() });

    await batch.commit();

    return { ok: true };
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

    const likeRef = firestore().collection(`posts/${postId}/likes`).doc(userId);
    const likeDoc = await likeRef.get();

    if (!likeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Like document does not exist.');
    }

    const postRef = firestore().collection('posts').doc(postId);
    const userLikeRef = firestore().collection(`users/${userId}/likes`).doc(postId);

    const batch = firestore().batch();
    batch.update(postRef, { likeCounter: firestore.FieldValue.increment(-1) });
    batch.delete(likeRef);
    batch.delete(userLikeRef);

    await batch.commit();

    return { ok: true };
  } catch (err) {
    throw new functions.https.HttpsError('not-found', err.message);
  }
});
