import express from "express";
import { parseEcgData } from "./parseEcgData";
import { tryParseDate } from "./utils";
import { getEcgMeasurements } from "./getEcgMeasurements";
import multer from "multer";

const CSV_DESTINATION_PATH = "uploads/csv";
const CSV_UPLOAD = multer({ dest: CSV_DESTINATION_PATH });
export const delineationRouter = express.Router();

delineationRouter.post("/delineation", CSV_UPLOAD.single("file"), async (request, response) => {
  if (request.file == null) {
    response.status(400).json({
      "error": "Missing delineation file",
    });

    return;
  }

  const recording = await parseEcgData(request.file.path);
  let recordingStart: Date | undefined = undefined;
  let filterStart: Date | undefined = undefined;
  let filterEnd: Date | undefined = undefined;

  if (request.body.recordingStart) {
    recordingStart = tryParseDate(request.body.recordingStart);
    filterStart = tryParseDate(request.body.filterStart);
    filterEnd = tryParseDate(request.body.filterEnd);
  }

  const measurements = getEcgMeasurements({
    events: recording,
    recordingStart,
    filterStart,
    filterEnd,
  });

  response.json(measurements);
});