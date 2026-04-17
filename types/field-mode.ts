import { z } from "zod";

/**
 * Tipos de dados para o Modo Corretor em Campo
 */

export type FieldModeStatus = "IDLE" | "ACTIVE" | "SYNCING" | "ERROR";

export type FieldModeAction =
  | "UPDATE_PROPERTY"
  | "ADD_NOTE"
  | "ADD_PHOTO"
  | "ADD_VIDEO"
  | "SYNC"
  | "OFFLINE_MODE";

export const FieldModePropertySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  address: z.string(),
  price: z.number().nullable().optional(),
  status: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).nullable().optional(),
  lastSyncedAt: z.date().nullable().optional(),
  isSynced: z.boolean(),
  pendingChanges: z.array(z.any()), // Use specific type if possible
  photos: z.array(z.any()),
  notes: z.array(z.any()),
  videos: z.array(z.any()),
});

export type FieldModeProperty = z.infer<typeof FieldModePropertySchema>;

export const createFieldModePropertyInput = z.object({
  title: z.string(),
  address: z.string(),
  price: z.number().nullable(),
  status: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export type CreateFieldModePropertyInput = z.infer<
  typeof createFieldModePropertyInput
>;

export interface FieldModeChange {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  action: FieldModeAction;
}

export interface FieldModePhoto {
  id: string;
  url: string;
  caption?: string;
  takenAt: Date;
  isUploaded: boolean;
  uploadError?: string;
}

export interface FieldModeNote {
  id: string;
  content: string;
  createdAt: Date;
  isUploaded: boolean;
  uploadError?: string;
}

export interface FieldModeVideo {
  id: string;
  url: string;
  duration?: number;
  takenAt: Date;
  isUploaded: boolean;
  uploadError?: string;
}

export interface FieldModeLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface FieldModeSyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: FieldModeError[];
  timestamp: Date;
}

export interface FieldModeError {
  id: string;
  item: string;
  error: string;
  timestamp: Date;
}

