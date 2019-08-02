#Build a Private Blockchain Notary Service
In this project, you will build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.
The application will persist the data (using LevelDB).
The application will allow users to identify the Star data with the owner.
#NodeJS Framework in this project
Express.js

#Tools & Packages
Node JS
crypto-js
Express JS
body-parser
bitcoinjs-message
hex2ascii

#Getting Started
Install all required packages using npm
Run npm install

#Testing
Run node server.js

#Endpoints
You will create a REST API endpoints that allows users to interact with the application.
The API will allow users to submit a validation request using POST request to localhost:8000/requestValidation with an address.
The API will allow users to validate the request using POST request to localhost:8000/message-signature/validate with your address and a signature.
The API will allow be able to submit the Star data using POST request to localhost:8000/block with your address and star details.
The API will allow lookup of Stars by hash, wallet address, and height using GET request to http://localhost:8000/stars/hash:[HASH], http://localhost:8000/stars/address:[ADDRESS] and http://localhost:8000/block/[HEIGHT]

Server should listen on port 8000
Recommended to use Postman or any other REST client



