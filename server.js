// imported libraries
const express = require('express');
const bodyParser = require('body-parser');
const StarValidation = require('./starValidation');
const starvalidation = new StarValidation();

const port = process.env.PORT || 8000;

// initialize express app
const app = express();


// use body parser to to enable JSON body to be presented in request object
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/requestValidation", (req, res) => {
    let address = req.body.address;
    if (address === '' || address === undefined) {
        res.status(400).json({
            "status": 400,
            "message": "No address is found"
        })
    } else {
        res.json(starvalidation.addRequestValidation(address));
    }
});

app.post("/message-signature/validate", (req, res) => {
    let address = req.body.address;
    let signature = req.body.signature;
    if (address === '' || address === undefined || signature === '' || signature === undefined) {
        res.status(400).json({
            "status": 400,
            "message": "No address or signature is found"
        })
    }
    res.json(starvalidation.validateRequestByWallet(address, signature));
});

app.post("/block", async(req, res) => {
    let address = await req.body.address;
    let star = await req.body.star;
    if (address === '' || address === undefined || star === '' || star === undefined) {
        res.status(400).json({
            "status": 400,
            "message": "Unable to verify address"
        })
    } else {
        res.json(await starvalidation.addBlock(address, star));
    }
});

app.get("/stars/hash::hash", async(req, res) => {
    let hash = await req.params.hash;
    if (hash === '' || hash === undefined) {
        res.status(400).json({
            "status": 400,
            "message": "No hash parameters is provided!"
        })
    } else{
       res.json(await starvalidation.getBlockHash(hash));
    }
});

app.get("/stars/address::address", async (req, res) => {
    let address = await req.params.address;
    if (address === '' || address === undefined) {
        res.status(400).json({
            "status": 400,
            "message": "No address parameters is provided!"
        })
    }else{
        res.json(await starvalidation.getBlockAddress(address));

    }
});

app.get("/stars/:height", async (req, res) => {
    let height = await req.params.height;
    if (height === '' || height === undefined) {
        res.status(404).json({
            "status": 404,
            "message": "No height parameters is provided!"
        })
    }else if (height === '0'){
        res.status(404).json({
            "status": 404,
            "message": "Genesis block does not include star property!"
        })
    }else{
        res.json( await starvalidation.getBlockHeight(height));

    }
});

// start express app
app.listen(port, () => console.log(`Server Listening for port: ${port}`));
