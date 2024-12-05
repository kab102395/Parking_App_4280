/* eslint-disable comma-dangle */
/* eslint-disable prefer-const */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-unused-vars */
/* eslint-disable indent */
/* eslint-disable camelcase */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: true }));
admin.initializeApp();

const db = admin.firestore();

app.get("/parking-spots", (request, response) => {
  db.collection("parking_spots")
    .get()
    .then((data) => {
      const parking_spots = [];
      data.forEach((doc) => {
        parking_spots.push({
          id: doc.id,
          lot: doc.data().lot,
          availability: doc.data().availability,
          gps_lat: doc.data().gps_lat,
          gps_long: doc.data().gps_long,
          reserved_at: doc.data().reserved_at,
          space_number: doc.data().space_number,
        });
      });
      return response.json(parking_spots);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err });
    });
});

app.put("/parking-spots/update/:id", async (request, response) => {
  try {
    console.log("Editing spot with document ID:", request.params);
    const id = request.params.id;
    const { availability } = request.body;

    if (!id || availability === undefined) {
      return response
        .status(400)
        .json({ message: "Missing document ID or availability field" });
    }

    const parkingSpotsRef = db.collection("parking_spots").doc(id);

    // Check if the document exists
    const docSnapshot = await parkingSpotsRef.get();
    if (!docSnapshot.exists) {
      return response.status(404).json({ error: "Parking Spot not found" });
    }

    // Data to update
    const data = {
      availability,
      reserved_at: new Date().toISOString(),
    };

    // Update the document
    await parkingSpotsRef.update(data);

    console.log("Parking Spot successfully reserved!");
    return response.status(200).json({ id, ...data });
  } catch (error) {
    console.error("Error updating Parking Spot: ", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

exports.app = functions.https.onRequest(app);
