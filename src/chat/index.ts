import * as functions from 'firebase-functions';
import admin, { firestore } from 'firebase-admin';

const bucket = admin.storage().bucket();

exports.onMessageDeletion = functions.database
  .ref('/chat/rooms/{roomName}/messages/{messageKey}/deleted')
  .onCreate(async (snapshot, context) => {
    try {
      const deleted = snapshot.val();

      if (deleted) {
        const messageSnapshot = await snapshot.ref.parent.ref.get();

        const message = messageSnapshot.val();

        if (message.type === 'picture') {
          // Check if the picture has been attached to a post.
          const postSnapshot = await firestore().collection('posts').where('pictureId', '==', message.pictureId).get();
          if (postSnapshot.docs.length > 0) {
            await postSnapshot.docs[0].ref.delete();
          }

          return messageSnapshot.ref.update({ text: '', pictureUrl: '' });
        }

        return messageSnapshot.ref.update({ text: '' });
      } else {
        return null;
      }
    } catch (err) {
      throw err;
    }
  });
