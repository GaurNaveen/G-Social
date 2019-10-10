const functions = require('firebase-functions');

// To use the admin you nedd to intialize it
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

// Fetching functions from our firebase data base
// We need firebae admin to run this code. Look at line 2.

exports.getPosts = functions.https.onRequest((req,res) => {
    // This will be used to retrieve the 'posts' collection
    admin.firestore().collection('Posts').get()
        .then(data => {
            let posts = [];
            // Fetch each document from that particular collection
            data.forEach(doc => {
                posts.push(doc.data());
            });
            return res.json(posts);
        })
        .catch(err => console.error(err));
})

// Function for creating Documents
exports.createPosts = functions.https.onRequest((req,res) => {
    // This will be a post request
    const newPost = {
        body: req.body.body, // The second .body is the property ofthe doc
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin.firestore()
        .collection('Posts')
        .add(newPost)
        .then(doc => {
            // If you're inside this block that means the posts has ben created succesfully
            res.json({message: `document ${doc.id} created successfully`});

        })
        .catch(err => {
            res.status(500).json({error: 'Something went wrong!'});
            console.error(err);
        })
})