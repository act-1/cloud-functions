import * as functions from 'firebase-functions';

export const attendEvent = functions.https.onCall((data, context) => {
  if (context.auth) {
    return {
      msg: context.auth.uid,
      token: context.auth.token,
    };
  }
  throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
});
