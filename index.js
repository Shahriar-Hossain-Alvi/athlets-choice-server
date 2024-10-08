const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://athletes-choice-919e3.web.app",
        "https://athletes-choice-919e3.firebaseapp.com"
    ]
}));



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfte2wh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productCollection = client.db('athletesChoice').collection('products');

        // get all products by sort option
        app.get('/allProducts', async (req, res) => {
            const { sortOption, page, size } = req.query;

            const pageNumber = parseInt(page);
            const productShowPerPage = parseInt(size);


            if (sortOption === 'Name') {
                const result = await productCollection.find().sort({ productName: 1 }).skip(pageNumber * productShowPerPage).limit(productShowPerPage).toArray();

                return res.send(result);
            }

            if (sortOption === 'Newest Added') {
                const result = await productCollection.find().sort({ dateAdded: -1 }).skip(pageNumber * productShowPerPage).limit(productShowPerPage).toArray();

                return res.send(result);
            }

            if (sortOption === 'Price low to high') {
                const result = await productCollection.find().sort({ price: 1 }).skip(pageNumber * productShowPerPage).limit(productShowPerPage).toArray();

                return res.send(result);
            }

            if (sortOption === 'Price high to low') {
                const result = await productCollection.find().sort({ price: -1 }).skip(pageNumber * productShowPerPage).limit(productShowPerPage).toArray();

                return res.send(result);
            }

        })


        // get searched products
        app.get('/searchProduct', async (req, res) => {
            const { productName } = req.query;
            const query = {
                productName: { $regex: productName, $options: 'i' }
            }

            const result = await productCollection.find(query).sort({ productName: 1 }).toArray();

            if (result.length === 0) {
                return res.send({ message: 0 })
            }

            res.send(result);
        })


        // get all the category names
        app.get('/categoryNames', async (req, res) => {
            const categories = await productCollection.aggregate([
                {
                    $group: {
                        _id: "$categoryName"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        categoryName: "$_id"
                    }
                }
            ]).toArray();
            // Extract category names into an array
            const categoryNames = categories.map(cat => cat.categoryName);

            res.send(categoryNames);
        })


        // get all the brand names
        app.get('/brandNames', async (req, res) => {
            const brands = await productCollection.aggregate([
                {
                    $group: {
                        _id: "$brandName"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        brandName: "$_id"
                    }
                }
            ]).toArray();
            // Extract category names into an array
            const brandNames = brands.map(brand => brand.brandName);

            res.send(brandNames);
        })


        // get products by category
        app.get('/filterByCategory', async (req, res) => {
            const { categoryName } = req.query;
            const query = {
                categoryName: categoryName
            }

            const result = await productCollection.find(query).toArray();

            res.send(result);
        })


        // get products by brand
        app.get('/filterByBrand', async (req, res) => {
            const { brandName } = req.query;
            const query = {
                brandName: brandName
            }

            const result = await productCollection.find(query).toArray();

            res.send(result);
        })

        // get products by price range
        app.get("/filterByPrice", async (req, res) => {
            const { minPrice, maxPrice } = req.query;

            const minimumPrice = parseInt(minPrice);
            const maximumPrice = parseInt(maxPrice);

            const query = {
                price: {
                    $lte: maximumPrice, $gte: minimumPrice
                }
            }

            const result = await productCollection.find(query).sort({ price: 1 }).toArray();

            res.send(result);
        })


        // get total number of products
        app.get("/productCount", async (req, res) => {
            const count = await productCollection.countDocuments();

            res.send({ count });
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



//start server
app.get('/', (req, res) => {
    res.send("Athlete's Choice server is Running");
})

app.listen(port, () => {
    console.log(`Athlete's Choice server is running at port no ${port}`);
})