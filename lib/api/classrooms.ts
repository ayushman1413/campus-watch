import { supabase } from '@/lib/supabase/supabaseClient';
import type { Classroom, ClassroomBlock } from '@/lib/types';

export const classroomsAPI = {
  // Get all blocks
  getAllBlocks: async () => {
    const { data, error } = await supabase
      .from('classroom_blocks')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get block details
  getBlock: async (blockId: string) => {
    const { data, error } = await supabase
      .from('classroom_blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get classrooms in block
  getClassroomsByBlock: async (blockId: string) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('block_id', blockId)
      .order('floor, room_number', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get all classrooms
  getAllClassrooms: async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get classroom details
  getClassroom: async (classroomId: string) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get available classrooms
  getAvailableClassrooms: async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('is_available', true)
      .order('floor, room_number', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Search classrooms
  searchClassrooms: async (query: string) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .or(`room_number.ilike.%${query}%,block_id.ilike.%${query}%`)
      .limit(20);

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Update classroom status
  updateClassroomStatus: async (classroomId: string, isAvailable: boolean) => {
    const { data, error } = await supabase
      .from('classrooms')
      .update({ is_available: isAvailable, last_updated: new Date() })
      .eq('id', classroomId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get classrooms by floor
  getClassroomsByFloor: async (blockId: string, floor: number) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('block_id', blockId)
      .eq('floor', floor)
      .order('room_number', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get classroom capacity
  getCapacity: async (classroomId: string) => {
    const classroom = await classroomsAPI.getClassroom(classroomId);
    return classroom?.capacity || 0;
  },

  // Get classroom statistics
  getStatistics: async () => {
    const { data: classrooms, error } = await supabase
      .from('classrooms')
      .select('is_available, capacity');

    if (error) throw new Error(error.message);

    const total = classrooms?.length || 0;
    const available = classrooms?.filter((c: any) => c.is_available).length || 0;
    const totalCapacity = classrooms?.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0) || 0;

    return {
      total_classrooms: total,
      available_classrooms: available,
      occupied_classrooms: total - available,
      total_capacity: totalCapacity,
      occupancy_rate: total > 0 ? ((total - available) / total * 100).toFixed(1) : 0,
    };
  },
};
