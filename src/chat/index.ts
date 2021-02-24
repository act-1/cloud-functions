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
          const pictureRef = firestore().collection('pictures').doc(message.pictureId);

          const pictureSnapshot = await pictureRef.get();
          const { storagePath } = pictureSnapshot.data();

          // TODO: Check if picture has been attached to a post.

          await bucket.file(storagePath).delete();

          await pictureRef.delete();
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
