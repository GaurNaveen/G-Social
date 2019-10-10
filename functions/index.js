const functions = require('firebase-functions');

// To use the admin you nedd to intialize it
const admin = require('firebase-admin');
admin.initializeApp();

// Config for firebase. Got it from the project settings in firebase dashboard.
const firebaseConfig = {
    apiKey: "AIzaSyA_U9PuAI1yEFsMRs-sla9lj1ZUNY-hPV0",
    authDomain: "g-social-9e95a.firebaseapp.com",
    databaseURL: "https://g-social-9e95a.firebaseio.com",
    projectId: "g-social-9e95a",
    storageBucket: "g-social-9e95a.appspot.com",
    messagingSenderId: "640906905134",
    appId: "1:640906905134:web:791208a95ebe4824b7c1bf",
    measurementId: "G-RYK9JS1ZL6"
  };

// Initialize Express
const express = require('express');
const app = express(); // app is the container for all our routes

// Initialize Firebase application
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

// This replaced admin.firestore() from all the code
const db = admin.firestore();


// Fetching functions from our firebase data base
// We need firebae admin to run this code. Look at line 2.
app.get('/getposts',(req,res) => {
    // This will be used to retrieve the 'posts' collection
    db
        .collection('Posts')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let posts = [];
            // Fetch each document from that particular collection
            data.forEach(doc => {
                posts.push({
                    postId: doc.data().id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(posts);
        })
        .catch((err) => console.error(err));
});


// Function for creating Documents/Posts
app.post('/createposts', (req,res) => {

    const newPost = {
        body: req.body.body, // The second .body is the property ofthe doc
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
        .collection('Posts')
        .add(newPost)
        .then(doc => {
            // If you're inside this block that means the posts has ben created succesfully
            res.json({message: `document ${doc.id} created successfully`});
        })
        .catch((err) => {
            res.status(500).json({error: 'Something went wrong!'});
            console.error(err);
        })
});


// Sign Up Route
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userHandle: req.body.userHandle
    };

    //  TODO: Validate Data 
    let token, userid;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                // This means that the handle already exists
                return res.status(400).json({handle: 'This handle already exists'});
            } else {
               return  firebase
                         .auth()
                        .createUserWithEmailAndPassword(newUser.email, newUser.password);

            }
        })
        .then(data => {
            userid = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            // Programmatically creating the user document
            const userCredentials = {
                handle: newUser.userHandle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userid
            };
            // Persists data
            return db.doc(`/users/${newUser.userHandle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({token});
        })

        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({email: 'Email already in use'});
            } else {
                return res.status(500).json({error: err});
            }
        });
});


// https: //baseurl.com/api/

exports.api = functions.https.onRequest(app);