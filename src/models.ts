export enum WaveType {
  P = "P",
  QRS = "QRS",
  T = "T",
  INV = "INV"
}

export interface EcgSignalEvent {
  readonly waveType: WaveType;

  /** Start of the wave in milliseconds */
  readonly onset: number;

  /** End of the wave in milliseconds */
  readonly offset: number;

  readonly waveTag: string[];

  /** Time of occurrence, if available. Determined by the start of measurement + onset */
  readonly occurredAt?: Date;
}

export interface EcgMeasurements {
  readonly prematurePWaves: number;
  readonly prematureQrsComplexes: number;
  readonly meanHeartRate: number;
  readonly minHeartRate: HeartRate;
  readonly maxHeartRate: HeartRate;
}

export interface HeartRate {
  /** Value in beats per minute */
  readonly rate: number;
  /** Time since start of ECG recording */
  readonly elapsedTime: number;
  /** Time of occurrence, if available */
  readonly occurredAt?: Date;
}
