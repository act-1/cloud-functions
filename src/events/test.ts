import functionsTest from 'firebase-functions-test';
const functionTest = functionsTest({ projectId: 'act1co' }, './serviceAccountKey.json');

import { attendEvent } from './';

// TODO: Write test that works.
test('attends event successfuly', async (done) => {
  const wrapped = functionTest.wrap(attendEvent);
  const snap = functionTest.firestore.makeDocumentSnapshot({ attendingCount: 20000 }, 'events/balfur');

  const result = await wrapped({ eventId: 'balfur', eventDate: '1608443187000' }, { auth: { uid: 'merryboop' } });
  console.log(result);
  expect(result).toBe(2);
  done();
});
