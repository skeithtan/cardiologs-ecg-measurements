import express from "express";
import * as bodyParser from "body-parser";
import { delineationRouter } from "./delineationRoute";

const SERVER_PORT = 8000;

function main() {
  const app = express();
  app.use(bodyParser.json());
  app.use(delineationRouter);

  app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}...`);
  });
}

void main();
