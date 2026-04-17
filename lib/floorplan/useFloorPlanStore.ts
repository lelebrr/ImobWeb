import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  FloorPlanState,
  FloorPlanElement,
  ToolType,
  Length,
} from "@/types/floorplan";

type FloorPlanStore = {
  elements: FloorPlanElement[];
  gridSize: Length;
  snapToGrid: boolean;
  darkMode: boolean;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  activeTool: ToolType;
  // actions
  setElements: (e: FloorPlanElement[]) => void;
  addElement: (el: FloorPlanElement) => void;
  updateElement: (id: string, partial: Partial<FloorPlanElement>) => void;
  removeElement: (id: string) => void;
  clearSelection: () => void;
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  setActiveTool: (t: ToolType) => void;
  setGridSize: (v: Length) => void;
  setSnapToGrid: (v: boolean) => void;
  setDarkMode: (v: boolean) => void;
  // undo/redo
  history: FloorPlanElement[][];
  future: FloorPlanElement[][];
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
};

const createFloorPlanStore = (propertyId: string) => {
  // In a real app, we would load from Supabase here based on propertyId
  return create<FloorPlanStore>()(
    immer((set, get) => ({
      elements: [],
      gridSize: 0.5,
      snapToGrid: true,
      darkMode: false,
      selectedElementId: null,
      hoveredElementId: null,
      activeTool: "select",
      history: [],
      future: [],

      setElements: (els: FloorPlanElement[]) => set({ elements: els }),
      addElement: (el: FloorPlanElement) =>
        set((state) => {
          state.elements.push(el);
          state.history.push(state.elements.map((e) => ({ ...e })));
          state.future = [];
        }),
      updateElement: (id: string, partial: Partial<FloorPlanElement>) =>
        set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id);
          if (idx !== -1) {
            state.elements[idx] = { ...state.elements[idx], ...partial };
            state.history.push(state.elements.map((e) => ({ ...e })));
            state.future = [];
          }
        }),
      removeElement: (id: string) =>
        set((state) => {
          state.elements = state.elements.filter((e) => e.id !== id);
          if (state.selectedElementId === id) state.selectedElementId = null;
          state.history.push(state.elements.map((e) => ({ ...e })));
          state.future = [];
        }),
      clearSelection: () =>
        set({ selectedElementId: null, hoveredElementId: null }),
      setSelectedElementId: (id: string | null) =>
        set({ selectedElementId: id }),
      setHoveredElementId: (id: string | null) => set({ hoveredElementId: id }),
      setActiveTool: (t: ToolType) => set({ activeTool: t }),
      setGridSize: (v: Length) => set({ gridSize: v }),
      setSnapToGrid: (v: boolean) => set({ snapToGrid: v }),
      setDarkMode: (v: boolean) => set({ darkMode: v }),
      pushHistory: () =>
        set((state) => {
          state.history.push(state.elements.map((e) => ({ ...e })));
          state.future = [];
        }),
      undo: () => {
        const state = get();
        if (state.history.length === 0) return;
        const current = state.elements.map((e) => ({ ...e }));
        set((s) => {
          s.future.push(s.elements);
          s.elements = s.history.pop()!;
        });
      },
      redo: () => {
        const state = get();
        if (state.future.length === 0) return;
        set((s) => {
          s.history.push(s.elements);
          s.elements = s.future.pop()!;
        });
      },
    })),
  );
};

export const useFloorPlanStore = (propertyId: string) => {
  // For simplicity, we create a new store per propertyId.
  // In production, you might want a map or a single store with propertyId scoped.
  return createFloorPlanStore(propertyId);
};
