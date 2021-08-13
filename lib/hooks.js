import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

// Custom hook to read  auth record and user profile doc
export function useUserData() {
    const [user] = useAuthState(auth);                      // we’ll grab the current user from firebase using the useAuthState(auth) hook  
    const [username, setUsername] = useState(null);         // Then, we’ll initialize state for the username with the useState() hook and useState will have an initial value of null

    useEffect(() => {
        // turn off realtime subscription
        let unsubscribe;                                    // We also want to listen to updates to that document in realtime so the first variable to define here is *unsubscribe … So we have time to turn off the realtime subscription when it’s no longer needed.

        if (user) {
        const ref = firestore.collection('users').doc(user.uid);
        unsubscribe = ref.onSnapshot((doc) => {
            setUsername(doc.data()?.username);
        });
        } else {
        setUsername(null);
        }

        return unsubscribe;
    }, [user]);

    return { user, username };
    }