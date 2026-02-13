import { create } from 'zustand';
import { classroomsAPI } from '@/lib/api/classrooms';
import type { Classroom, ClassroomBlock } from '@/lib/types';

interface ClassroomState {
  blocks: ClassroomBlock[];
  classrooms: Classroom[];
  selectedClassroom: Classroom | null;
  availableClassrooms: Classroom[];
  statistics: any;
  loading: boolean;
  error: string | null;

  fetchAllBlocks: () => Promise<void>;
  fetchClassroomsByBlock: (blockId: string) => Promise<void>;
  fetchAllClassrooms: () => Promise<void>;
  fetchAvailableClassrooms: () => Promise<void>;
  fetchClassroom: (classroomId: string) => Promise<void>;
  searchClassrooms: (query: string) => Promise<void>;
  updateClassroomStatus: (classroomId: string, isAvailable: boolean) => Promise<void>;
  getStatistics: () => Promise<void>;
  setSelectedClassroom: (classroom: Classroom | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useClassroomStore = create<ClassroomState>((set) => ({
  blocks: [],
  classrooms: [],
  selectedClassroom: null,
  availableClassrooms: [],
  statistics: null,
  loading: false,
  error: null,

  fetchAllBlocks: async () => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.getAllBlocks();
      set({ blocks: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchClassroomsByBlock: async (blockId) => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.getClassroomsByBlock(blockId);
      set({ classrooms: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchAllClassrooms: async () => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.getAllClassrooms();
      set({ classrooms: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchAvailableClassrooms: async () => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.getAvailableClassrooms();
      set({ availableClassrooms: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchClassroom: async (classroomId) => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.getClassroom(classroomId);
      set({ selectedClassroom: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  searchClassrooms: async (query) => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.searchClassrooms(query);
      set({ classrooms: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateClassroomStatus: async (classroomId, isAvailable) => {
    try {
      set({ loading: true, error: null });
      const updated = await classroomsAPI.updateClassroomStatus(classroomId, isAvailable);
      set((state) => ({
        classrooms: state.classrooms.map((c) => (c.id === classroomId ? updated : c)),
        selectedClassroom: state.selectedClassroom?.id === classroomId ? updated : state.selectedClassroom,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getStatistics: async () => {
    try {
      set({ loading: true, error: null });
      const data = await classroomsAPI.getStatistics();
      set({ statistics: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedClassroom: (classroom) => set({ selectedClassroom: classroom }),
  clearError: () => set({ error: null }),
  reset: () => set({ blocks: [], classrooms: [], selectedClassroom: null, availableClassrooms: [], statistics: null, loading: false, error: null }),
}));
