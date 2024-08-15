const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

//start server
app.get('/', (req, res) => {
    res.send("Athlete's Choice server is Running");
})

app.listen(port, () => {
    console.log(`Athlete's Choice server is running at port no ${port}`);
})