// UI component for user profile - This is just basic UI React Stuff 
export default function UserProfile({ user }) {
    return (
        <div className="box-center">
            <img src={user.photoURL || '/hacker.png'} className="card-img-center" />
            <p>
                <i>@{user.username}</i> 
            </p>
            <h1>{user.username}'s Due Diligence</h1>
            {/* <h1>{user.displayName || 'Anonymous User'}</h1> */}
        </div>
    );
}  


// In the UserProfile we just have an image (with a users photoURL), then we show their username, as well as their display name that comes from their google account