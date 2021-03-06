import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { UserContext } from '../lib/context';
import { auth } from '../lib/firebase';

// Top navbar
export default function Navbar() {
    const { user, username } = useContext(UserContext); // this uses the useContext hook to pass in the UserContext as itβs argument

    const router = useRouter();

    const signOut =  () => {
        auth.signOut();
        router.reload();
    }

    return (
        <nav className="navbar">
        <ul>
            <li>
                <Link href="/">
                    <button className="btn-logo"> π  Home</button>
                </Link>
            </li>
            <li>
            <Link href="/">
                    <button className="btn-logo"> π Quick 10</button>
                </Link>
            </li>
            <li>
            <Link href="/">
                    <button className="btn-logo"> π₯ Top 10</button>
                </Link>
            </li>

        {/* AUTH user is signed-in and has username */}
        {username && (
            <>
                <li className="push-left">
                    <button onClick={signOut}>Sign Out</button>
                </li>
                <li>
                    <Link href="/admin"><button className="btn-blue">Share Due Dilligence</button></Link>
                </li>
                <li>
                    <Link href={`/${username}`}><img src={user?.photoURL || '/hacker.png'} /></Link>
                </li>
            </>
        )}

        {/* UNAUTH user is not signed OR has not created username */}
        {!username && (
            <li>
                <Link href="/enter"><button className="btn-blue">Log in</button></Link>
            </li>
            )}
        </ul>
        </nav>
    );
}
