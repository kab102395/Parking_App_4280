import React, { useState, useEffect } from "react";
import styles from "./Home.module.css";
import baseUrl from "../urls/context-urls";
import moment from "moment";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

function ParkingPage() {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedLot, setSelectedLot] = useState("All");
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [closestLocation, setClosestLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState("bnGiFxovgWRYZgE3HZhF");
  const containerStyle = {
    height: "600px",
    width: "100%",
  };
  const center = {
    lat: 37.5247083,
    lng: -120.8591297,
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBjfX1cBGFSWah-eOMluQLTHxRy3fFN_18",
    libraries: ["marker"],
    mapIds: ["b46b54ee5a47e2e8"],
  });

  const markerIcon =
    isLoaded && window.google
      ? {
          url: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
          scaledSize: new window.google.maps.Size(20, 20),
        }
      : null;

  const reservedIcon =
    isLoaded && window.google
      ? {
          url: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
          scaledSize: new window.google.maps.Size(20, 20),
        }
      : null;

  const myReservedIcon =
    isLoaded && window.google
      ? {
          url: "https://maps.gstatic.com/mapfiles/ms2/micons/yellow-dot.png",
          scaledSize: new window.google.maps.Size(20, 20),
        }
      : null;

  const [lots, setLots] = useState([
    { id: 1, name: "Lot 1", lat: 37.523989, lng: -120.858677, spots: [] },
    { id: 2, name: "Lot 2", lat: 37.522525, lng: -120.86043, spots: [] },
    { id: 3, name: "Lot 3", lat: 37.524831, lng: -120.861308, spots: [] },
    { id: 4, name: "Lot 4", lat: 37.526049, lng: -120.861002, spots: [] },
    { id: 5, name: "Lot 5", lat: 37.5269005, lng: -120.8609039, spots: [] },
    { id: 6, name: "Lot 6", lat: 37.526268, lng: -120.8606192, spots: [] },
    { id: 7, name: "Lot 7", lat: 37.5271206, lng: -120.8569568, spots: [] },
  ]);

  const [buildings, setBuildings] = useState([
    {
      id: 1,
      name: "Demegarsso Bava Hall",
      lat: 37.5255306,
      lng: -120.8589628,
      lots: [],
    },
    {
      id: 2,
      name: "J. Burton Vasché Library",
      lat: 37.5248411,
      lng: -120.8596972,
      spots: [],
    },
    {
      id: 3,
      name: "Art Building",
      lat: 37.5239023,
      lng: -120.8587442,
      spots: [],
    },
    {
      id: 4,
      name: "Student Recruitment & Outreach",
      lat: 37.5239023,
      lng: -120.8587442,
      spots: [],
    },
    {
      id: 5,
      name: "Nora and Hashem Naraghi Hall of Science",
      lat: 37.5237702,
      lng: -120.8565554,
      spots: [],
    },
    {
      id: 6,
      name: "Child Development Center Stanislaus State",
      lat: 37.5235936,
      lng: -120.8539996,
      spots: [],
    },
    {
      id: 7,
      name: "John Stuart Rogers Faculty Development Center",
      lat: 37.5242924,
      lng: -120.8535009,
      spots: [],
    },
    {
      id: 8,
      name: "Ed & Bertha Fitzpatrick Arena",
      lat: 37.5253577,
      lng: -120.8528186,
      spots: [],
    },
    {
      id: 9,
      name: "Student Fitness Center",
      lat: 37.5259186,
      lng: -120.8528206,
      spots: [],
    },
    {
      id: 10,
      name: "Stan State Baseball Field",
      lat: 37.5269495,
      lng: -120.8544345,
      spots: [],
    },
    {
      id: 11,
      name: "Residential Life Village I",
      lat: 37.5271606,
      lng: -120.8553469,
      spots: [],
    },
    {
      id: 12,
      name: "University Police Department",
      lat: 37.527404,
      lng: -120.8564131,
      spots: [],
    },
    {
      id: 13,
      name: "Capital Planning & Facilities Management",
      lat: 37.5266146,
      lng: -120.857739,
      spots: [],
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const url = `${baseUrl.baseUrl}/parking-spots`;
      try {
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setParkingSpots(data);
          setMarkers(
            data.map((spot) => ({
              id: spot.id,
              position: {
                lat: Number(spot.gps_lat),
                lng: Number(spot.gps_long),
              },
              title: `Lot: ${spot.lot} - Space Number: ${spot.space_number}`,
              availability: spot.availability,
              lot: spot.lot,
              space_number: spot.space_number || "N/A",
              icon: spot.availability ? markerIcon : reservedIcon,
            }))
          );
        } else {
          console.error("Error fetching parking spots:", response.status);
        }
      } catch (error) {
        console.error("Error fetching parking spots:", error);
      }
    };

    fetchData();
  }, []);

  const findClosestLocation = async (origin) => {
    if (!isLoaded || !window.google) return;
    setLoading(true);
    // Initialize the Distance Matrix Service
    const service = new window.google.maps.DistanceMatrixService();
    const destinations = lots.map((loc) => ({
      lat: loc.lat,
      lng: loc.lng,
    }));
    // Call the Distance Matrix API
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const distances = response.rows[0].elements;
          // Find the closest location
          let minDistance = Number.MAX_VALUE;
          let closest = null;
          distances.forEach((element, index) => {
            if (
              element.status === "OK" &&
              element.distance.value < minDistance
            ) {
              minDistance = element.distance.value;
              closest = lots[index];
            }
            console.log("Closest: ", closest);
            setClosestLocation(closest);
            setMarkers(
              parkingSpots
                .filter((spot) => spot.lot === closest?.id)
                .map((spot) => ({
                  id: spot.id,
                  position: {
                    lat: Number(spot.gps_lat),
                    lng: Number(spot.gps_long),
                  },
                  title: `Lot: ${spot.lot}`, // Properly display lot number
                  availability: spot.availability,
                  lot: spot.lot, // Correctly set the lot value
                  space_number: String(spot.space_number) || "N/A", // Ensure space number is displayed
                }))
            );
            return closest;
          });
        }
      }
    );
  };

  const updateMarkers = (spots, selectedSpot) => {
    setMarkers(
      spots.map((spot) => ({
        id: spot.id,
        position: {
          lat: Number(spot.gps_lat),
          lng: Number(spot.gps_long),
        },
        title: `Lot: ${spot.lot} - Space Number: ${spot.space_number}`,
        availability: spot.availability,
        lot: spot.lot,
        space_number: spot.space_number || "N/A",
        icon:
          spot.id === selectedSpot?.id
            ? myReservedIcon // User reserved spot is yellow
            : spot.availability
            ? markerIcon // Available spot is green
            : reservedIcon, // Reserved spot is red
      }))
    );
  };

  useEffect(() => {
    if (parkingSpots && parkingSpots.length > 0) {
      updateMarkers(parkingSpots, selectedSpot);
    }
  }, []);

  const reserveSpot = async (id, availability) => {
    try {
      const url = `${baseUrl.baseUrl}/parking-spots/update/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability: availability }),
      });

      if (response.ok) {
        console.log("Spot updated successfully:", id);
        const updatedSpots = parkingSpots.map((spot) =>
          spot.id === id ? { ...spot, availability: availability } : spot
        );
        setParkingSpots(updatedSpots);

        if (!availability) {
          // Set the selected spot to the one just reserved
          setSelectedSpot(updatedSpots.find((spot) => spot.id === id));
        } else if (selectedSpot?.id === id) {
          // Clear selected spot if unreserved
          setSelectedSpot(null);
        }

        updateMarkers(updatedSpots, selectedSpot);
      } else {
        console.error("Failed to update spot:", await response.text());
      }
    } catch (error) {
      console.error("Error updating spot:", error);
    }
  };

  const handleLotChange = async (event) => {
    const selectedValue = event.target.value;

    await setSelectedLot(selectedValue);
    await setSelectedBuilding("All");
    // Set markers based on the selected lot
    if (selectedValue === "All") {
      // Show all spots when "All" is selected
      setMarkers(
        parkingSpots.map((spot) => ({
          id: spot.id,
          position: {
            lat: Number(spot.gps_lat),
            lng: Number(spot.gps_long),
          },
          title: `Lot: ${spot.lot}`, // Properly display lot number
          availability: spot.availability,
          lot: spot.lot, // Correctly set the lot value
          space_number: String(spot.space_number) || "N/A", // Ensure space number is displayed
        }))
      );
    } else {
      // Show only the spots from the selected lot
      const filteredSpots = parkingSpots.filter(
        (spot) => String(spot.lot) === selectedValue
      );
      setMarkers(
        filteredSpots.map((spot) => ({
          id: spot.id,
          position: {
            lat: Number(spot.gps_lat),
            lng: Number(spot.gps_long),
          },
          title: `Lot: ${spot.lot}`, // Properly display lot number
          availability: spot.availability,
          lot: spot.lot, // Correctly set the lot value
          space_number: String(spot.space_number) || "N/A", // Ensure space number is displayed
        }))
      );
    }
  };

  const handleBuildingChange = async (event) => {
    const selectedValue = event.target.value;
    await setSelectedBuilding(selectedValue);
    await setSelectedLot("All");

    // If "All" is selected, we reset the markers to show all parking spots
    if (selectedValue === "All") {
      setMarkers(
        parkingSpots.map((spot) => ({
          id: spot.id,
          position: {
            lat: Number(spot.gps_lat),
            lng: Number(spot.gps_long),
          },
          title: `Lot: ${spot.lot}`, // Properly display lot number
          availability: spot.availability,
          lot: spot.lot, // Correctly set the lot value
          space_number: String(spot.space_number) || "N/A", // Ensure space number is displayed
        }))
      );
      setClosestLocation(null); // Reset the closest location
    } else {
      // Find the selected building
      const selectedBuilding = buildings.find(
        (bldg) => bldg.id.toString() === selectedValue
      );

      // If the selected building is found, find the closest parking lot
      if (selectedBuilding) {
        let bldgLocation = {
          lat: selectedBuilding.lat,
          lng: selectedBuilding.lng,
        };

        const closest = await findClosestLocation(bldgLocation);
      }
    }
  };

  return isLoaded ? (
    <>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className={styles.container}>
          <h1 className={styles.heading}>Available Parking Spots</h1>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            {/* Add back the "Filter by Lot" selector */}
            <div className="mb-4 by-lot">
              <label htmlFor="lot-select" className="mr-2">
                Filter by Lot:
              </label>
              <select
                id="lot-select"
                value={selectedLot}
                onChange={handleLotChange}
                className="p-2 border rounded"
              >
                <option value="All">All</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Add back the "Filter by Building" selector */}
            <div className="mb-4 px-2 by-building">
              <label htmlFor="building-select" className="mr-2">
                Filter by Building:
              </label>
              <select
                id="building-select"
                value={selectedBuilding}
                onChange={handleBuildingChange}
                className="p-2 border rounded"
              >
                <option value="All">All</option>
                {buildings.map((bldg) => (
                  <option key={bldg.id} value={bldg.id}>
                    {bldg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reserved Spot Section */}
          {selectedSpot && (
            <div className="p-3 border mb-4 rounded bg-blue-100 text-blue-900">
              <h2 className="text-2xl font-semibold">Reserved Spot</h2>
              <p className="mt-2">
                <strong>Lot:</strong> {selectedSpot.lot}
              </p>
              <p>
                <strong>Space Number:</strong>{" "}
                {selectedSpot.space_number || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    selectedSpot.availability
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {selectedSpot.availability ? "Available" : "Reserved"}
                </span>
              </p>
            </div>
          )}

          {/* Google Map with Markers */}
          <div className="mb-3">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={17}
              onLoad={(mapInstance) => setMap(mapInstance)}
              mapTypeId="roadmap"
            >
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  title={marker.title}
                  icon={marker.icon}
                />
              ))}
            </GoogleMap>
          </div>

          {/* List of parking spots below the map */}
          {/* List of parking spots below the map */}
          <div className="mt-8">
            <h2 className="text-3xl font-semibold mb-6">
              List of All Parking Spots
            </h2>
            <div className="overflow-auto max-h-96 p-4 border rounded bg-white">
              {markers.length > 0 ? (
                markers.map((marker) => (
                  <div key={marker.id} className="p-4 mb-4 border-b">
                    <h3 className="text-xl font-semibold mb-2">
                      Lot: {marker.lot}
                    </h3>
                    <p className="mb-1">
                      Space Number: {marker.space_number || "N/A"}
                    </p>
                    <p className="mb-1">
                      Status:{" "}
                      <span
                        className={
                          marker.availability
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {marker.availability ? "Available" : "Reserved"}
                      </span>
                    </p>
                    <button
                      className={`mt-2 px-4 py-2 text-white rounded ${
                        marker.availability
                          ? "bg-blue-500 hover:bg-blue-700"
                          : "bg-red-500 hover:bg-red-700"
                      }`}
                      onClick={() =>
                        reserveSpot(marker.id, !marker.availability)
                      }
                    >
                      {marker.availability ? "Reserve" : "Unreserve"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-black">No spots available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}

export default ParkingPage;
