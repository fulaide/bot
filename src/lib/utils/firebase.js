// Assuming you have Firebase initialized and a Firestore instance available
// For example, you may have already called: const db = firebase.firestore();
import { db } from './../firebase/db.js'
import { collection, orderBy, getDocs, onSnapshot,  query , limit, serverTimestamp , addDoc } from "firebase/firestore"



export async function getLastNDaysDataFromFirestore(collectionName, numberOfDays) {
    try {
        const collectionRef = collection(db, collectionName)
        const collectionQuery = query(collectionRef, orderBy("createdAt", 'desc'), limit(numberOfDays));
        const querySnapshot = await getDocs(collectionQuery);

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
        const collectionRefSave = collection(db, collectionName)

        // Generate a unique ID for the new document
        //const newDocumentRef = collectionRef.doc();

        // Get the current timestamp
        const timestamp = serverTimestamp();

        // Create the data object for the new document
        // const data = {
        //     id: newDocumentRef.id,
        //     createdAt: timestamp,
        //     value: value
        // };

        // const docData = {
        //     stringExample: "Hello world!",
        //     booleanExample: true,
        //     numberExample: 3.14159265,
        //     dateExample: Timestamp.fromDate(new Date("December 10, 1815")),
        //     arrayExample: [5, true, "hello"],
        //     nullExample: null,
        //     objectExample: {
        //         a: 5,
        //         b: {
        //             nested: "foo"
        //         }
        //     }
        // };

        // Add a new document with a generated id.
        const docRef = await addDoc(collectionRefSave, {
            createdAt: timestamp,
            value: value
        });

        console.log("Document written with ID: ", docRef.id);
        
        
        // Add the new document to the collection
        //await newDocumentRef.set(data);

        //console.log('Document added successfully:', data);

        return docRef;
    } catch (error) {
        console.error('Error adding document to Firestore:', error);
        throw error;
    }
}

// Example usage:
// const valueToAdd = 'Sample String Value'; // Replace with the actual string value

// const addedDocument = await addDocumentToFirestore(collectionName, valueToAdd);
// console.log('Added Document:', addedDocument);
