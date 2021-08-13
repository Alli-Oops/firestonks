import styles from '../styles/Post.module.css';
import PostContent from '../components/PostContent';
import FireButton from '../components/FireButton';
import AuthCheck from '../components/AuthCheck';
import Metatags from '../components/Metatags';
import { UserContext } from '../lib/context';
import { firestore, getUserWithUsername, postToJSON } from '../../lib/firebase';

import Link from 'next/link';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useContext } from 'react';

export async function getStaticProps({ params }) {
    const { username, slug } = params;
    const userDoc = await getUserWithUsername(username);

    let post;
    let path;

    if (userDoc) {
        const postRef = userDoc.ref.collection('posts').doc(slug);
        post = postToJSON(await postRef.get());

        path = postRef.path;
    }

    return {
        props: { post, path },
        revalidate: 5000, // revalidate tells next to regenerate this page on the server when new requests come in - but only on certain time intervals.
    };
}

export async function getStaticPaths() { // this tells next which paths to render
  // Improve my using Admin SDK to select empty docs
    const snapshot = await firestore.collectionGroup('posts').get();   // this query gives us acces to all the posts 

    const paths = snapshot.docs.map((doc) => {                         // .. then we can map each one of them down into an object that contains the username and slug that would be in the URL or PATH to that page
        const { slug, username } = doc.data();
        return {
        params: { username, slug },
        };
    });

    return {
        // must be in this format:
        // paths: [
        //   { params: { username, slug }}
        // ],
        paths,
        fallback: 'blocking',
    };  // How is next going to run this function each time we create a new post?? with traditional static generation - next would have no way of knowing if new data was aded to the db so it would just default to a 404 error
}       // by adding a fallback value of blocking solve this - 
        // when a user navigates to a page that has not been rendered yet, it tells next.js to fallback to regular server-side rendering - 
        // once it renders the page, then it can be cached on the CDN like all the other pages

export default function Post(props) {
    const postRef = firestore.doc(props.path);
    const [realtimePost] = useDocumentData(postRef);

    const post = realtimePost || props.post;

    const { user: currentUser } = useContext(UserContext);

    return (
        <main className={styles.container}>
        <Metatags title={post.title} description={post.title} />
        
        <section>
            <PostContent post={post} />
        </section>

        <aside className="card">
            <p>
            <strong>{post.heartCount || 0} 🔥 </strong>
            </p>

            <AuthCheck
            fallback={
                <Link href="/enter">
                <button>🔥  Sign Up</button>
                </Link>
            }
            >
            <FireButton postRef={postRef} />
            </AuthCheck>

            {currentUser?.uid === post.uid && (
            <Link href={`/admin/${post.slug}`}>
                <button className="btn-blue">Edit Post</button>
            </Link>
            )}
        </aside>
        </main>
    );
}
