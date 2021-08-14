// import transparentbanner from '../public/transparentbanner';
import PostFeed from '../components/PostFeed';
import Metatags from '../components/Metatags';
import Loader from '../components/Loader';
import { firestore, fromMillis, postToJSON } from '../lib/firebase';

import { useState } from 'react';

// Max post to query per page
const LIMIT = 10;

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) { 
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  // Get next page in pagination query
  const getMorePosts = async () => {
    setLoading(true);                                 // set the loading state to true
    const last = posts[posts.length - 1];             // we need the last post from the current list to run a paginated query.

    const cursor = typeof last.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;
    // Important note: the createdAt timestamp might be a number OR it could be a firestorm timestamp depending on whether we fetched that data from the server or on the client side.
    // it needs to be a firestore timestamp so if its not a number - we will convert it to a firestore timestamp using the fromMillis() method provided by the firestore timestamp object. Otherwise we can just use the existing timestamp

    const query = firestore                           // with the timestamp of the last document - we make a collectionGroup() query 
      .collectionGroup('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)                             // it’s going to start AFTER the last document in the current list
      .limit(LIMIT);                                  

    const newPosts = (await query.get()).docs.map((doc) => doc.data());
    // ^^ fetch that data then map each individual document to its document data,

    // Then update the state of this component to concatenate the newPosts to the existing list that we already have in the UI
    setPosts(posts.concat(newPosts));
    setLoading(false);                                // From there, we set the loading state to false

    if (newPosts.length < LIMIT) {                    // And if the newPost length is less than the limit, then we know we have reached the end of the database.
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags title="Home Page" description="Get the latest posts on our site" />
      <img src="/transparentbanner.png"></img>
      <img src="/stonks_meme.png"></img>
      <div className="card card-info">
        <h2> Services </h2>
        <h3> FireStonks.com is A Platform for Sharing Information </h3>
        <p>Sign up for an 👨‍🎤 account, ✍️ share due diligence, then 🔥 fire content created by other users. All public content is server-rendered and search-engine optimized.</p>
        </div>

        <div className="card card-info">
        <h2> About FireStonks.com </h2>
        <p>Any content posted on Firestonks.com reflects the opinions of only the authors who are associated persons of Firestonks.com and do not reflect the views of Firestonks.com or any of its subsidiaries or affiliates.</p>
        <p>This platform is for independent investors and stock market enthusiasts to share their thoughts, research, and opinions. Content on FireStonk.com is not provided by FireStonks.com. The Firestonks.com platform is intended for informational purposes only, any content on FireStonks.com is not intended to serve as a recommendation to buy or sell any security in a self-directed brokerage account or any other account, and are not an offer or sale of a security.</p>
        <p>Any content on FireStonks.com is also not official research reports and are not intended to serve as the basis for any investment decision. Any third-party information provided therein does not reflect the views FireStonks.com or any of their subsidiaries or affiliates. All investments involve risk and the past performance of a security or financial product does not guarantee future results or returns. </p>
        <p>Keep in mind that while diversification may help spread risk, it does not assure a profit or protect against loss. There is always the potential of losing money when you invest in securities or other financial products.</p>
        <p>Investors should consider their investment objectives and risks carefully before investing. The price of a given security may increase or decrease based on market conditions and customers may lose money, including their original investment. FireStonks.com</p>
        <p>Any content shared on FireStonks.com may not be representative of the experience of other customers and are not guarantees of future performance or success. FireStonks.com</p>
      </div>

      <PostFeed posts={posts} />  {/* we use the posts prop / state to show our PostFeed component */}

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}  {/*if it’s not loading AND if its not at the end -- this button lets users “load more” posts.*/}

      <Loader show={loading} /> {/* <Loader> if the component is loading. */}

      {postsEnd && 'You have reached the end!'} {/* Then if we’ve reached the end, we will show the text “you’ve reached the end.” */}
    </main>
  );
}
