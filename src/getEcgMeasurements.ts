import { EcgMeasurements, EcgSignalEvent, HeartRate, WaveType } from "./models";
import { limitToOneDecimal } from "./utils";

export function getEcgMeasurements({ events, recordingStart, filterStart, filterEnd }: {
  events: EcgSignalEvent[],
  recordingStart?: Date;
  filterStart?: Date;
  filterEnd?: Date;
}): EcgMeasurements {
  // Calculate event occurrence and apply filters
  const eventsWithOccurrence: EcgSignalEvent[] = events.map((event) => {
    if (recordingStart == null) {
      return event;
    }

    const occurredAt = new Date(recordingStart.getTime());
    occurredAt.setMilliseconds(recordingStart.getMilliseconds() + event.onset);
    return ({ ...event, occurredAt });
  }).filter((event) => {
    if (recordingStart == null) {
      // No date value to compare
      return true;
    }

    const withinFilterStart = filterStart == null || event.occurredAt! >= filterStart;
    const withinFilterEnd = filterEnd == null || event.occurredAt! <= filterEnd;
    return withinFilterStart && withinFilterEnd;
  });

  const prematureTaggedEvents = eventsWithOccurrence.filter((event) => event.waveTag.includes("premature"));
  const prematurePWaves = prematureTaggedEvents.filter((event) => event.waveType === WaveType.P).length;
  const prematureQrsComplexes = prematureTaggedEvents.filter((event) => event.waveType === WaveType.QRS).length;
  const heartRateValues = computeHeartRate(eventsWithOccurrence);

  const { mean: meanHeartRate, min: minHeartRate, max: maxHeartRate } = computeHeartRateDispersion(heartRateValues);

  return {
    prematurePWaves,
    prematureQrsComplexes,
    meanHeartRate,
    minHeartRate,
    maxHeartRate,
  };
}

export function computeHeartRate(events: EcgSignalEvent[]): HeartRate[] {
  const qrsComplexes = events.filter((event) => event.waveType === WaveType.QRS);
  const heartRateValues: HeartRate[] = [];

  let prevQrsOnset: number | undefined = undefined;

  for (const event of qrsComplexes) {
    if (prevQrsOnset == null) {
      prevQrsOnset = event.onset;
      continue;
    }

    // The time intervals between consecutive heart beats are customarily measured
    // in the electrocardiogram from the beginning of a QRS complex to the beginning
    // of the next QRS complex
    const intervalMs = event.onset - prevQrsOnset;
    const intervalSeconds = intervalMs / 1000;

    // Beats per minute value
    const heartRate = limitToOneDecimal(60 / intervalSeconds);

    heartRateValues.push({
      rate: heartRate,
      elapsedTime: event.onset,
      occurredAt: event.occurredAt,
    });

    prevQrsOnset = event.onset;
  }

  return heartRateValues;
}

export function computeHeartRateDispersion(heartRateValues: HeartRate[]): {
  /** Mean in beats per minute */
  mean: number,
  min: HeartRate,
  max: HeartRate
} {
  let heartRateSum = 0;
  let min = heartRateValues[0];
  let max = heartRateValues[0];

  for (let i = 1; i < heartRateValues.length; i++) {
    let current = heartRateValues[i];
    heartRateSum += current.rate;

    if (current.rate < min.rate) {
      min = current;
    }

    if (current.rate > max.rate) {
      max = current;
    }
  }

  const mean = limitToOneDecimal(heartRateSum / heartRateValues.length);

  return { mean, min, max };
}
