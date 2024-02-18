# Introduction

This project is written in TypeScript and utilizes the Node.js runtime. To get started, make sure you have Node.js and Yarn installed on your machine. To install the project dependencies, navigate to the base directory in your terminal and run the following command:

```
yarn
```

After the dependencies are installed, you can start the application using:
```
yarn start
```
This will launch the server, and you can access it at `http://localhost:8000`.

# Obtaining Measurements

Measurements can be obtained by making a POST request to the `/delineation` route. Ensure that the request is a Multipart form request with the following parameters:

* `file`: Attach the CSV file.
* `recordingStart` (Optional): Specify the start of the recording in ISO 8601 format.
* `filterStart` and / or `filterEnd` (Optional): Set the date filters in ISO 8601 format.

# API Filters

The API includes `filterStart` and `filterEnd` to enhance event filtering. It's important to note that these filters will only work when the date of the start of the recording is provided. Ensure that you provide all dates in the ISO 8601 format for accurate results.
