import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { UserContext } from '../lib/context';
import { useUserData } from '../lib/hooks';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  const userData = useUserData();       // userData is the value resulting from calling our custom hook useUserData() that is inside the lib/hooks.js file


  return (
    <UserContext.Provider value={ userData }>
      <Navbar />
      <Component {...pageProps} />
      <Toaster/>
    </UserContext.Provider>
  );
}

export default MyApp;

/*
^^ Here ^^ in _app.js We wrap the child components inside the <UserContext.Provider>
Then, we include the value={userData} —> which will be the passed in value of 
the specific user and username. This will come from firebase.

So with that wrapper - When we provide the userData from firebase 
- it is available and all the child components can access the user AND username.
*/