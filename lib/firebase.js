/* ######### firebase.js (ts respectively) contains code that involves the database >> ########## */

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

 // Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCC0aDxm5hdO49CctAWwXxeVPMa5BuSYz8",
    authDomain: "firestonks2.firebaseapp.com",
    projectId: "firestonks2",
    storageBucket: "firestonks2.appspot.com",
    messagingSenderId: "973961154217",
    appId: "1:973961154217:web:c1f9b9f13a777fc91e63b8"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Auth exports (This specifies the Auth SDK we want to work with)
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

// Firestore exports (This specifies the firestore SDK we want to work with)
export const firestore = firebase.firestore();
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const increment = firebase.firestore.FieldValue.increment;

// Storage exports (This specifies the firebase SDK we want to work with)
export const storage = firebase.storage();
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;
// ^ STATE_CHANGED is a special firebase event we can listen to that will tell us the progress of the fire upload
/// Helper functions

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) { 
    const usersRef = firestore.collection('users');                         // makes a reference to the *users collection*
    const query = usersRef.where('username', '==', username).limit(1);      // then runs a query where the ‘username’ == that ‘username’ and returns that hit from the database 
    const userDoc = (await query.get()).docs[0];                            // Then, we can run that query by calling await query.get and then we will take the first [0] document from the array in that query (that value is what we want to return - aka userDoc)
    return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
        createdAt: data?.createdAt.toMillis() || 0,
        updatedAt: data?.updatedAt.toMillis() || 0,
    };
}