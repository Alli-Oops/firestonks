import Link from 'next/link';

export default function PostFeed({ posts, admin }) {
    return posts ? posts.map((post) => <PostItem post={post} key={post.slug} admin={admin} />) : null;
    } // ^ here we have a list of posts that we then .map() to an individual PostItem component

function PostItem({ post, admin = false }) {
    // Naive method to calc word count and read time
    const wordCount = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);
    // this takes the post content and then splits it by all the spaces and counts them. 
    // Then it calculates the minutes to read based on the word count.

    // Then we return some basic UI : 
    return (
        <div className="card">
        <Link href={`/${post.username}`}> {/* This is a Link to the User's Profile */}
            <a>
            <strong>By @{post.username}</strong>
            </a>
        </Link>

        <Link href={`/${post.username}/${post.slug}`}> {/* This is a Link to the post title */}
            <h2>
            <a>{post.title}</a>
            </h2>
        </Link>

        <footer>
            <span>
            {wordCount} words. {minutesToRead} min read
            </span>
            <span className="push-left">🔥 {post.heartCount || 0} Fire </span>
        </footer>   {/* This is a Like count */}

        {/* If admin view, show extra controls for user */}
        {admin && (
            <>
            <Link href={`/admin/${post.slug}`}>
                <h3>
                <button className="btn-blue">Edit</button>
                </h3>
            </Link>

            {post.published ? <p className="text-success">Live</p> : <p className="text-danger">Unpublished</p>}
            </>
        )}
        </div>
    );
}
