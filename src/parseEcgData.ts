import * as fs from "fs";
import { EcgSignalEvent, WaveType } from "./models";
import { parse } from "csv-parse";

export async function parseEcgData(path: string): Promise<EcgSignalEvent[]> {
  const events: EcgSignalEvent[] = [];
  const parser = fs
    .createReadStream(path)
    .pipe(parse({
      // Allows rows having inconsistent number of columns
      relax_column_count: true,
    }));

  for await (const record of parser) {
    events.push(parseRecord(record));
  }

  // Ensure events are in order, sorted by event onset
  events.sort((a, b) => {
    return a.onset - b.onset;
  });

  return events;
}

function parseRecord(record: string[]): EcgSignalEvent {
  return {
    waveType: record[0] as WaveType,
    onset: parseInt(record[1]),
    offset: parseInt(record[2]),
    waveTag: record.slice(3),
  };
}