import { useRef, useState, useEffect } from "react";

import Places from "./components/Places.jsx";
import { AVAILABLE_PLACES } from "./data.js";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import { sortPlacesByDistance } from "./loc.js";

const storedIds = JSON.parse(localStorage.getItem("selectedPlaces")) || [];
const storedPlaces = storedIds.map((id) =>
  AVAILABLE_PLACES.find((place) => place.id === id)
);

function App() {
  const selectedPlace = useRef();
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [availblePlaces, setAvailablePlaces] = useState([]);
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);

  // useEffect, unlike useState or useRef does not return a value, though. It needs two arguments.
  // The first argument is a function that should wrap your side effect code.
  // The second argument is an array of dependencies of that effect function.
  // If you define this dependencies array, if you do not omit it, React will actually take a look
  // at the dependencies specified there.
  // And it will only execute this effect function again If the dependency values changed.
  // IMPORTANT: The idea behind useEffect is that this function which you pass as
  // first argument to useEffect will be executed by React AFTER every component execution.
  // If the app starts and the app component function executes,
  // this code here will not be executed right away.
  // Instead, it's only after the app component function execution finished.
  useEffect(() => {
    // The navigator is an object exposed by the browser to our JavaScript code that runs in the browser.
    // We then access geolocation and call the getCurrentPosition method to get the location.
    // The code below is a SIDE EFFECT because the main goal of every component function
    // is to return renderable JSX code.
    // Now this code here is a side effect because it's not directly related with that task.
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );
      setAvailablePlaces(sortedPlaces);
    });
  }, []);

  function handleStartRemovePlace(id) {
    setModalIsOpen(true)
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    // Unlike this navigator code, which had to run when that component function code executed,
    // this localStorage data storage code only runs upon user interaction
    // and therefore, doesn't create an infinite loop even if we would be updating some state here.
    // That's really important to understand, not every side effect needs useEffect.
    const storedIds = JSON.parse(localStorage.getItem("selectedPlaces")) || [];
    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem(
        "selectedPlaces",
        JSON.stringify([id, ...storedIds])
      );
    }
  }

  function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    etModalIsOpen(false);

    const storedIds = JSON.parse(localStorage.getItem("selectedPlaces")) || [];
    localStorage.setItem(
      "selectedPlaces",
      JSON.stringify([storedIds.filter((id) => id !== selectedPlace.current)])
    );
  }

  return (
    <>
      <Modal open={modalIsOpen}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={"Select the places you would like to visit below."}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={AVAILABLE_PLACES}
          // The fallback text prop is supported by this component and set it to Sorting places by distance.
          // It is simply some fallback text that will be shown during the time
          // where we don't have any places yet because we're still looking for the user's location.
          fallbackText="Sorting places by distance..."
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
