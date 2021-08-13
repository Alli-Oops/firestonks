import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
    const { username } = useContext(UserContext);

    return username ? props.children : props.fallback || <Link href="/enter">You must be signed in</Link>;
}


/*
The AuthCheck Component will only render it’s children if the user is authenticated.
In the AuthCheck component, we import our user context, then get the current users’ username with the useContect hood.

If we do have a username - then we will render the props children - aka the components nested inside this component. But if not, well fallback to some-kind of fallback component or as a default , we will link back to the sign in page.

The end result is an efficient way to guard routes from unauthenticated navigation
*/