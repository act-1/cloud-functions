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
