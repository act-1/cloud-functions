import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';

/**
 * Creates a document with ID -> uid in the `users` collection.
 *
 * @param {Object} userRecord Contains the auth, uid and displayName info.
 * @param {Object} context Details about the event.
 */
exports.createUserDocument = functions.auth.user().onCreate((user, context) => {});
