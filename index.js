const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const PORT = 6000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

console.log("Testing final for video");

// Persistent storage path
const PERSISTENT_STORAGE_PATH = '/shrey_PV_dir';

app.listen(PORT, () => {
    console.log(`Container 1 is listening on port ${PORT}`);
});

// POST endpoint to store the file
app.post('/store-file', async (req, res) => {
    const inputData = req.body;
    const { file, data } = req.body;

    if (!inputData || !inputData.file || !inputData.data) {
        return res.json({
            file: null,
            error: "Invalid JSON input."
        });
    }

    const { file: fileName, data: fileData } = inputData;
    const filePath = path.join(PERSISTENT_STORAGE_PATH, fileName);
    // const filePath = path.resolve(__dirname, '../data', file);

    try {
        // Ensure the directory exists
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        
        // Write the file data to the persistent storage
        await fs.promises.writeFile(filePath, fileData);
        console.log(`File ${fileName} stored successfully.`);

        return res.json({
            file: fileName,
            message: "Success."
        });
    } catch (error) {
        console.error("Error storing file:", error);
        return res.json({
            file: fileName,
            error: "Error while storing the file to the storage."
        });
    }
});

// POST endpoint to calculate product sum
app.post('/calculate', async (req, res) => {
    const inputData = req.body;
    const { file, data } = req.body;


    if (!inputData || !inputData.file || !inputData.product) {
        return res.json({
            file: null,
            error: "Invalid JSON input."
        });
    }

    const { file: fileName, product: productDetails } = inputData;
    const filePath = path.join(PERSISTENT_STORAGE_PATH, fileName);
    // const filePath = path.resolve(__dirname, '../data', file);

    try {
        // Check if the file exists
        await fs.promises.access(filePath, fs.constants.F_OK);
    } catch {
        return res.json({
            file: fileName,
            error: "File not found."
        });
    }

    try {
        // Send a request to Container 2 to calculate the sum
        const apiResponse = await axios.post('http://container2-service:90/sum', { file: fileName, product: productDetails });
        return res.json(apiResponse.data);
    } catch (error) {
        console.error("Error communicating with Container 2:", error);
        return res.status(error.response?.status || 500).json(error.response?.data || { error: "Internal Server Error" });
    }
});
