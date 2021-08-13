import { auth, firestore, googleAuthProvider } from '../lib/firebase';
import { UserContext } from '../lib/context';
import Metatags from '../components/Metatags';

import { useEffect, useState, useCallback, useContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth'
import debounce from 'lodash.debounce';


export default function Enter(props) {
    const { user, username } = useContext(UserContext);

    // 1. user signed out <SignInButton />
    // 2. user signed in, but missing username <UsernameForm />
    // 3. user signed in, has username <SignOutButton />
    return (
        <main>
        <Metatags title="Enter" description="Sign up for this amazing app!" />
        {user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
        </main>
    );
    }

    // Sign in with Google button
    function SignInButton() {
    const signInWithGoogle = async () => {
        await auth.signInWithPopup(googleAuthProvider);
    };

    return (
        <>
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={'/google.png'} width="30px" /> Sign in with Google
        </button>
        <button onClick={() => auth.signInAnonymously()}>
            Sign in Anonymously
        </button>
        </>
    );
    }

    // Sign out button
    function SignOutButton() {
    return <button onClick={() => auth.signOut()}>Sign Out</button>;
    }

    // Username form
    function UsernameForm() {
    const [formValue, setFormValue] = useState('');                             // this is what the user types into the form
    const [isValid, setIsValid] = useState(false);                              // tells us whether the input ^ is valid or taken
    const [loading, setLoading] = useState(false);                              // this will be true when we're asunchronously checking if the username already exists in the db

    const { user, username } = useContext(UserContext);

    const onSubmit = async (e) => {                                             // without this method -- if you submit the form - nothing will happen. This holds the logic to connect with / query the database
        e.preventDefault();                                                     // << first we need to prevent the browser's defualt behavior - to refresh the page

        // Create refs for both documents
        const userDoc = firestore.doc(`users/${user.uid}`);                     // this references the firestore document in the users collection and we interpolate the dymanic data provided by a given current users' uid.
        const usernameDoc = firestore.doc(`usernames/${formValue}`);            // then this references 

        // Commit both docs together as a batch write.
        const batch = firestore.batch();                                        // this batch function 
        batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName });
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();
    };

    const onChange = (e) => {
        // Force form value typed in form to match correct format
        const val = e.target.value.toLowerCase();                               // << grab the value from the form and convert it to lowercase
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;       // << regular expression defines the format that we want the username in

        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
        setFormValue(val);
        setLoading(false);
        setIsValid(false);
        }

        if (re.test(val)) {
        setFormValue(val);
        setLoading(true);
        setIsValid(false);
        }
    };

    //

    useEffect(() => {                                                          // this useEffect hook uses the formValue as a dependency -- so it listens  to this formValue and any time it changes -- we will execute a READ to the database by running the CheckUsername function >>

        checkUsername(formValue);
    }, [formValue]);

    // Hit the database for username match after each debounced change
    // useCallback is required for debounce to work
    const checkUsername = useCallback(                                        // in order for a debounce() to work in React - we need to wrap everything in the useCallback hook. Because anytime React re-renders, it creates a new function object which will not be debounced. useCallback allows the debounce function to be memoized - so it can be easily debounced between state changes
        debounce(async (username) => {                                        // we wrap this funtion with the debounce helper function
        if (username.length >= 3) {                                           // verify that the username length is greater than 3 -- making sure it **could be** a valid username in the database
            const ref = firestore.doc(`usernames/${username}`);               // then we need a reference to that username document amd 
            const { exists } = await ref.get();                               // await a get request of the database to see if that document exists
            console.log('Firestore read executed!');                          // also console log everytime this function runs because it will tell use when a firestore READ has been executed
            setIsValid(!exists);                                              // if the document does not exist - we know that this is a valid selection
            setLoading(false);
        }                                                                     // We installed/use the debounce() because this is not a function we want to execture every-time the form value changes
        }, 500),                                                               
        []                                                                    // the debounce prevents the execution of the function ... until... the last event stops firing OR the last formValue has changeed after a delay of 500ms
    );                                                                        // i.e. the function waits for the user to stop typing for 5seconds before doing a READ from the database and checking the input validity

    return (
        !username && (
        <section>
            <h3>Choose Username</h3>
            <form onSubmit={onSubmit}>                                                                               {/* this is the form where the user selects their username onSubmit  */}
            <input name="username" placeholder="myname" value={formValue} onChange={onChange} />                     {/* we bind the input to our formValue’s state with *value={formValue} -- controlled input */}
            <UsernameMessage username={formValue} isValid={isValid} loading={loading} />                             {/* We also need the handler onChange - to handle whenever that value changes. */}
            <button type="submit" className="btn-green" disabled={!isValid}>
                Choose
            </button>

            <h3>Debug State</h3>
            <div>
                Username: {formValue}
                <br />
                Loading: {loading.toString()}
                <br />
                Username Valid: {isValid.toString()}
            </div>
            </form>
        </section>
        )
    );
    }

    function UsernameMessage({ username, isValid, loading }) {                                                      //  These are error messages for the different statese that the form can be in - this will give a nicer user experience
    if (loading) {
        return <p>Checking...</p>;
    } else if (isValid) {
        return <p className="text-success">{username} is available!</p>;
    } else if (username && !isValid) {
        return <p className="text-danger">That username is taken!</p>;
    } else {
        return <p></p>;
    }
}