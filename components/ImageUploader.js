import { useState } from 'react';
import { auth, storage, STATE_CHANGED } from '../lib/firebase';
import Loader from './Loader';

// Uploads images to Firebase Storage
export default function ImageUploader() {
    const [uploading, setUploading] = useState(false); // this will be true while the file is uploading
    const [progress, setProgress] = useState(0); // this will give the exact progress as a percentage the upload has completed
    const [downloadURL, setDownloadURL] = useState(null); // the download URL will be available when the upload is complete

  // Creates a Firebase Upload Task
    const uploadFile = async (e) => {
        // Get the file
        const file = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        // Makes reference to the storage bucket location 3m
        const ref = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
        setUploading(true);

        // Starts the upload
        const task = ref.put(file);

        // Listen to updates to upload task
        task.on(STATE_CHANGED, (snapshot) => {
            const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
            // the pct divides the bytesTransferred by the total bytes of the image, then multiplys by 100 to get the percentage for the upload progress
            setProgress(pct);
        });

        // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
        task
            .then((d) => ref.getDownloadURL()) // this is not a native promise so you cant use async await with it.
            .then((url) => {
                setDownloadURL(url); 
                setUploading(false);
            });
    };

    return (
        <div className="box">
            <Loader show={uploading} />
            {uploading && <h3>{progress}%</h3>}

            {!uploading && (
            <>
                <label className="btn">
                    📸 Upload Img
                    <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                </label>
            </>
        )}
        

        {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
        </div>
    ); // note: instead of an html button - we use a form lable. then inside that label there is a "type="file"
    // we do this because html file inputs are very hard to style but if you put it in a label the lable will autofocus to that input when clicked. 
    // when a files selected it will trigger our upload file handler - and we specify to only accept files like png, gif or jpeg
}
