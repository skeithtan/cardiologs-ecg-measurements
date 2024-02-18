import { EcgSignalEvent, HeartRate, WaveType } from "../models";
import { computeHeartRate, getEcgMeasurements } from "../getEcgMeasurements";

describe("getEcgMeasurements", () => {
  it("should count premature waves correctly", () => {
    const events: EcgSignalEvent[] = [
      { waveType: WaveType.P, onset: 0, offset: 50, waveTag: [] },
      { waveType: WaveType.QRS, onset: 100, offset: 150, waveTag: ["premature"] },
    ];

    const measurements = getEcgMeasurements({ events });

    expect(measurements.prematurePWaves).toBe(0);
    expect(measurements.prematureQrsComplexes).toBe(1);
  });

  it("should filter events based on the start date", () => {
    const events: EcgSignalEvent[] = [
      { waveType: WaveType.QRS, onset: hoursToMs(1), offset: 50, waveTag: ["premature"] },
      { waveType: WaveType.QRS, onset: hoursToMs(2), offset: 150, waveTag: ["premature"] },
    ];

    const filterStart = mockDate(2);
    const measurements = getEcgMeasurements({ events, filterStart, recordingStart: mockDate() });

    expect(measurements.prematureQrsComplexes).toBe(1);
  });

  it("should filter events based on the end date", () => {
    const events: EcgSignalEvent[] = [
      { waveType: WaveType.QRS, onset: hoursToMs(1), offset: hoursToMs(1), waveTag: ["premature"], occurredAt: mockDate(1) },
      { waveType: WaveType.QRS, onset: hoursToMs(2), offset: hoursToMs(2), waveTag: ["premature"], occurredAt: mockDate(2) },
      { waveType: WaveType.QRS, onset: hoursToMs(3), offset: hoursToMs(3), waveTag: ["premature"], occurredAt: mockDate(3) },
    ];

    const filterEnd = mockDate(2);
    const measurements = getEcgMeasurements({ events, filterEnd, recordingStart: mockDate() });

    expect(measurements.prematureQrsComplexes).toBe(2);
  });

  it("should filter events based on both start and end dates", () => {
    const events: EcgSignalEvent[] = [
      { waveType: WaveType.QRS, onset: hoursToMs(0), offset: 50, waveTag: ["premature"], occurredAt: new Date(100) },
      { waveType: WaveType.QRS, onset: hoursToMs(2), offset: 150, waveTag: ["premature"], occurredAt: new Date(200) },
      { waveType: WaveType.QRS, onset: hoursToMs(4), offset: 250, waveTag: ["premature"], occurredAt: new Date(300) },
    ];

    const filterStart = mockDate(1);
    const filterEnd = mockDate(3);

    const measurements = getEcgMeasurements({ events, filterStart, filterEnd, recordingStart: mockDate() });

    expect(measurements.prematureQrsComplexes).toBe(1);
  });
});

describe("computeHeartRate", () => {
  it("should calculate heart rates correctly for consecutive QRS complexes", () => {
    const events: EcgSignalEvent[] = [
      { waveType: WaveType.QRS, onset: 0, offset: 100, waveTag: [] },
      { waveType: WaveType.QRS, onset: 200, offset: 300, waveTag: [], occurredAt: new Date() },
    ];

    const result: HeartRate[] = computeHeartRate(events);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    expect(result[0].rate).toBeCloseTo(60 / (events[1].onset - events[0].onset) * 1000, 3);
  });

  it("should handle empty events array", () => {
    const result: HeartRate[] = computeHeartRate([]);
    expect(result).toEqual([]);
  });

  it("should handle a single QRS complex", () => {
    const events: EcgSignalEvent[] = [{
      waveType: WaveType.QRS,
      onset: 0,
      offset: 100,
      waveTag: [],
      occurredAt: new Date(),
    }];
    const result: HeartRate[] = computeHeartRate(events);

    expect(result.length).toBe(0); // Since there's only one QRS complex, there's no interval to calculate
  });

  it("should handle events with missing occurredAt dates", () => {
    const events: EcgSignalEvent[] = [
      { waveType: WaveType.QRS, onset: 0, offset: 100, waveTag: [] },
      { waveType: WaveType.QRS, onset: 200, offset: 300, waveTag: [] },
    ];

    const result: HeartRate[] = computeHeartRate(events);

    expect(result.length).toBe(1); // Only one heart rate can be calculated since occurredAt is missing in the second event
  });
});

function hoursToMs(hours: number): number {
  return hours * 60 * 60 * 1000;
}

function mockDate(advanceByHours?: number): Date {
  const date = new Date();

  if (advanceByHours != null) {
    date.setHours(date.getHours() + advanceByHours);
  }

  return date;
}