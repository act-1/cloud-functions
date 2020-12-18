import * as functions from 'firebase-functions';

function getTokenId(req: functions.https.Request): string | Error {
  const authHeader = req.get('Authorization');
  if (authHeader) {
    const tokenId = authHeader.split('Bearer ')[1];
    return tokenId;
  }

  throw new Error(`Authentication header wasn't found.`);
}

export const attendEvent = functions.https.onRequest((req, res) => {
  try {
    const tokenId = getTokenId(req);
    res.status(200).json({ ok: true, message: tokenId });
  } catch (err) {
    res.status(401).json({ ok: false, message: 'Unauthenticated' });
  }
});
