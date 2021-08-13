import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import PostFeed from '../../components/PostFeed';
import { UserContext } from '../../lib/context';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';

import { useContext, useState } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function AdminPostsPage(props) {
    return (
        <main>
        <AuthCheck>
            <PostList />
            <CreateNewPost />
        </AuthCheck>
        </main>
    );
}

function PostList() {       // The PostList required a query to the ‘posts’ sub collection under the currently authenticated user.
    const ref = firestore.collection('users').doc(auth.currentUser.uid).collection('posts');
    // ^^ we make a reference to the current user document then the ‘posts’ sub collection under it
    // From that ref we can then order by the createdAt timestamp 
    const query = ref.orderBy('createdAt');
    // then use the useCollection hook from react-firebase-hooks to read that collection in realtime
    const [querySnapshot] = useCollection(query);
    // Then take the query snapshot and map it’s documents down to the document data.
    const posts = querySnapshot?.docs.map((doc) => doc.data());
    // we want the full query snapshot if we want to add additional controls like the ability to delete a document.

    // we want to return/show the document data here in the UI 
    //... so we will include it in the return that data in the <PostFeed> component that we created earlier 
    return (
        <>
        <h1>Manage your Posts</h1>
        <PostFeed posts={posts} admin /> {/* We pass to this component the {posts} value which is the query snapshot ^^ of the current user's 'posts' subcollection*/}
        </>
    );
}

function CreateNewPost() {
    const router = useRouter();                         // use the next.js router with the useRouter() hook 
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('');

  // Ensure slug is URL safe
    const slug = encodeURI(kebabCase(title));

  // Validate length
    const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
    const createPost = async (e) => {
        e.preventDefault();
        const uid = auth.currentUser.uid;
        const ref = firestore.collection('users').doc(uid).collection('posts').doc(slug);

    // Tip: give all fields a default value here
        const data = {
            title: 'Default Title',
            slug: 'default-title',
            uid: 'abc123defaultTOme',
            username: 'defaultmememan',
            published: false,
            content: '# hello world!',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartCount: 0,
        };

        await ref.set(data); // we call ref.set(data) with ^ that formatted (data) ^ to commit the post document to firestore.


        toast.success('Post created!');

        // Imperative navigation after doc is set
        router.push(`/admin/${slug}`);
    };

    return (
        <form onSubmit={createPost}>
        <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Article!"
            className={styles.input}
        />
        <p>
            <strong>Slug:</strong> {slug}
        </p>
        <button type="submit" disabled={!isValid} className="btn-green">
            Create New Post
        </button>
        </form>
    );
}