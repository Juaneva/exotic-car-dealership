const express = require('express')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 3001
// Body Parser Setup
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// If Search criteria is wrong - Image to display
const wrongImage = "https://toppng.com/uploads/preview/cross-wrong-cross-transparent-background-11562851969ihtu0kgnjy.png";

// Utility function - Gets car data, and creates the file if it doesn't exist
function getCars() {
    try {
        const content = fs.readFileSync('cars.json')
        return JSON.parse(content)
    } catch (e) { // file non-existent
        fs.writeFileSync('cars.json', '[]')
        return []
    }
}

// Add a car and over write the json file
function addCar(carSpecifications) {
    const cars = getCars()
    cars.push(carSpecifications)
    fs.writeFileSync('cars.json', JSON.stringify(cars))
}

// Delete a car based on the index and over write the json file
function deleteCar(carIndex) {
    const cars = getCars()
    cars.splice(carIndex, 1)
    fs.writeFileSync('cars.json', JSON.stringify(cars))
}

// Update a car based on the index and over write the json file
function updateCar(carIndex, carSpecifications) {
    const cars = getCars()
    // At Index position, replace 1 element with another elements: 
    cars.splice(carIndex, 1, carSpecifications);
    fs.writeFileSync('cars.json', JSON.stringify(cars))
}

// Display all the Cars that is on the System
app.get('/api', (req, resp) => {
    const cars = getCars()
    // Send all the cars
    resp.send(cars)  
})

// Search by Car Make
app.get('/cars/:make', (req, resp) => {
    // Get entered params and replace _ with space
    const carMake = (req.params.make).replace("_", " ")

    // Get the current array to determine if Make is there
    const cars = getCars()

    // Create a new Array, add all the cars with the make name
    let displaySearchCar = [];
    for (i = 0; i < cars.length; i++) {
        if (cars[i].make == carMake) {
            displaySearchCar.push(cars[i]);
        }
    }
    // Send all the cars that meets the search criteria
    resp.send(displaySearchCar)
})


// Create a new Car
app.post('/cars', (req, resp) => {
    // Get entered params and replace _ with space
    const carMake = (req.body.make).replace("_", " ")
    const carModel = (req.body.model).replace("_", " ")
    const carSeats = req.body.seats
    const carImg = req.body.img

    // Get the current array to determine ID
    const cars = getCars()
    let carId = (cars.length + 1);

    // Give the car a Unique ID
    // If the ID already exist +1 and test again until an open ID position is available
    let idExist = true;
    while (idExist === true) {
        idExist = false;
        for (i = 0; i < cars.length; i++) {
            if (carId == cars[i].id) {
                idExist = true;
            }
        }
        if (idExist === true) {
            carId++;
        }
    }

    // Construct the specifications
    const carSpecifications = {
        "id": carId,
        "make": carMake,
        "model": carModel,
        "seats": carSeats,
        "img":carImg
    }
    // Add to cars
    addCar(carSpecifications)
    // Send detail of the car that was successfully captured
    resp.send(carSpecifications)
})

// Delete Car by ID
app.delete('/cars/:id', (req, resp) => {
    // Get the ID param & Get the array of Cars
    const carId = req.params.id
    const cars = getCars()

    // Find the index of the car to be deleted
    let carIndex = -1;
    for (i = 0; i < cars.length; i++) {
        if (cars[i].id == carId) {
            carIndex = i;
        }
    }

    // If index was found (Bigger than -1), action the delete otherwise let user know the ID does not exist
    if (carIndex > -1) {
        // Get the information of the car that will be deleted
        const deletedCar = cars[carIndex];
        // Delete the car based on Index
        deleteCar(carIndex)
        // Let the user know specifications of the car that was deleted
        resp.send(deletedCar)
    } else {
        // Let the user know the car was "NOT FOUND" to be deleted
        let data = {id:`${carId}`,make:"NOT FOUND",model:"TO BE DELETED",seats:"NOT FOUND",img:`${wrongImage}`};
        resp.send(data)
    }
})

// Update car by ID
app.put('/cars', (req, resp) => {

     // Get entered params and replace "_" with space
     const carId = parseInt((req.body.id))
     const carMake = (req.body.make).replace("_", " ")
     const carModel = (req.body.model).replace("_", " ")
     const carSeats = req.body.seats
     const carImg = req.body.img

    // Construct the specifications
    const carSpecifications = {
        "id": carId,
        "make": carMake,
        "model": carModel,
        "seats": carSeats,
        "img":carImg
    }

    // Get the current array to determine Index of the car to be updated
    const cars = getCars()
    let carIndex = -1;
    for (i = 0; i < cars.length; i++) {
        if (cars[i].id == carId) {
            carIndex = i;
        }
    }

    // If index was found (Bigger than -1), action the Update otherwise let user know the ID was not found
    if (carIndex > -1) {
        // Get the information of the car that will be Updated to Display to the user
        const updatedCar = cars[carIndex];

        // Update the car based on Index and use the new specifications
        updateCar(carIndex, carSpecifications)

        // Let the user know the car was Updated and specifications of the car Before it was updated
        resp.send(updatedCar)
    } else {
        // If ID was not found - let user know Car ID was not found
        let data = {id:`${carId}`,make:"NOT FOUND",model:"NOT UPDATED",seats:"NOT FOUND",img:`${wrongImage}`};
        resp.send(data)
    }
})


app.listen(port, () => console.log('Listening engaged'))