// Assuming you have Firebase initialized and a Firestore instance available
// For example, you may have already called: const db = firebase.firestore();
import { db } from './../firebase/db.js'
import { collection, orderBy, getDocs, onSnapshot,  query , limit } from "firebase/firestore"
import { getDoc, doc, setDoc,  } from "firebase/firestore";



export async function getLastNDaysDataFromFirestore(collectionName, numberOfDays) {
    try {
       // const collectionRef = db.collection(collectionName);

        // Query the collection and order by timestamp (or any other relevant field)
       // const querySnapshot = await collectionRef.orderBy('timestamp', 'desc').limit(numberOfDays).get();
       // const querySnapshot = await getDocs(collectionRef.orderBy('createdAt', 'desc').limit(numberOfDays));

        const collectionRef = collection(db, collectionName)
        const collectionQuery = query(collectionRef, orderBy("createdAt", 'desc'), limit(numberOfDays));
        const querySnapshot = await getDocs(collectionQuery);

        // const querySnapshot = await getDocs(collection(db, collectionName));
        // Extract data from the documents
        const lastNDaysData = querySnapshot.docs.map(doc => doc.data());

       return lastNDaysData;
    } catch (error) {
        console.error('Error fetching data from Firestore:', error);
        throw error;
    }
}

// Example usage:
// const collectionName = 'price'; // Replace with your actual collection name
// const numberOfDaysToRetrieve = 7; // Replace with the desired number of days

// const lastNDaysData = await getLastNDaysDataFromFirestore(collectionName, numberOfDaysToRetrieve);
// console.log(`Last ${numberOfDaysToRetrieve} Days Data:`, lastNDaysData);



// Assuming you have Firebase initialized and a Firestore instance available
// For example, you may have already called: const db = firebase.firestore();

export async function addDocumentToFirestore(collectionName, value) {
    try {
        const collectionRef = db.collection(collectionName);

        // Generate a unique ID for the new document
        const newDocumentRef = collectionRef.doc();

        // Get the current timestamp
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();

        // Create the data object for the new document
        const data = {
            id: newDocumentRef.id,
            timestamp,
            value
        };

        // Add the new document to the collection
        await newDocumentRef.set(data);

        console.log('Document added successfully:', data);

        return data;
    } catch (error) {
        console.error('Error adding document to Firestore:', error);
        throw error;
    }
}

// Example usage:
// const valueToAdd = 'Sample String Value'; // Replace with the actual string value

// const addedDocument = await addDocumentToFirestore(collectionName, valueToAdd);
// console.log('Added Document:', addedDocument);
