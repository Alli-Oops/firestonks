import { getUserWithUsername, postToJSON } from '../../lib/firebase';
import UserProfile from '../../components/UserProfile';
import Metatags from '../../components/Metatags';
import PostFeed from '../../components/PostFeed';

// We need to export the async function getServerSideProps()
// And automatically run this function on the server anytime this page is requested
export async function getServerSideProps({ query }) {
    const { username } = query;

    const userDoc = await getUserWithUsername(username); // this will return the *user document* thats with the *username document*

  // If no user, short circuit to 404 page
    if (!userDoc) {
        return {
            notFound: true,
        };
    }

  // JSON serializable data
    let user = null;        // initialize variable for the user data
    let posts = null;       // initialize variable for the posts data...
                            
    if (userDoc) {                          // ... then - if the userDoc exists...
        user = userDoc.data();               
        const postsQuery = userDoc.ref              //  we will make a query from that userDoc reference (userDoc.ref)
            .collection('posts')                    // we will reference the posts collection ... 
            .where('published', '==', true)         // ...  where ‘published’ == true ...
            .orderBy('createdAt', 'desc')           // ... and order them by newest to oldest
            .limit(5);                              // ... then limit the query to 5 posts ...
        posts = (await postsQuery.get()).docs.map(postToJSON);
    }                                               // ... then we can execute the query by calling await postsQuery.get() then map each individual document to its document data
    // IMPORTANT: 

    return {                        // The function needs to return an object that has a props value - the *user* and *posts*
        props: { user, posts },     // there props will be passed to the page component as props
    };                              // in order to fetch that information - we first need to determine what that username is
}                                   // we get the username from the URL — which will be available to us on the { query } object


export default function UserProfilePage({ user, posts }) {
    return (
        <main>
            <Metatags title={user.username} description={`${user.username}'s public profile`} />
            <UserProfile user={user} />  {/* This component takes the *user* prop to show the actual UI to the end user */}
            <PostFeed posts={posts} />      {/* This component takes the *posts* prop to show the actual UI to the end user */}
        </main>
    );
}