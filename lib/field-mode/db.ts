import Dexie, { Table } from 'dexie';
import { FieldVisit, OfflineAction, SmartCameraMedia } from '@/types/field-mode';

/**
 * FIELD MODE LOCAL DATABASE - IMOBWEB 2026
 * Powered by Dexie.js for extreme reliability and performance.
 */
export class FieldDatabase extends Dexie {
  draft_properties!: Table<any>;
  field_visits!: Table<FieldVisit>;
  media_queue!: Table<SmartCameraMedia>;
  sync_queue!: Table<OfflineAction>;

  constructor() {
    super('ImobWebFieldDB');
    this.version(1).stores({
      draft_properties: '++id, propertyId, timestamp',
      field_visits: '++id, propertyId, checkInTime, status',
      media_queue: '++id, timestamp, detectedRoom',
      sync_queue: '++id, type, timestamp, retryCount'
    });
  }
}

export const db = new FieldDatabase();
