import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/report';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  counts: () => [...reportKeys.all, 'count'] as const,
  stats: () => [...reportKeys.all, 'stats'] as const,
};

// Fetch all reports with location data
export const useReports = () => {
  return useQuery({
    queryKey: reportKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          name,
          lastname,
          address,
          help_needed,
          phone,
          location_lat,
          location_long,
          urgency_level,
          status,
          created_at
        `)
        .not('location_lat', 'is', null)
        .not('location_long', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Report[];
    },
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Fetch single report by ID
export const useReport = (id: string | undefined) => {
  return useQuery({
    queryKey: reportKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error('Report ID is required');

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Report;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Fetch reports count
export const useReportsCount = () => {
  return useQuery({
    queryKey: reportKeys.counts(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Filter and sort options for paginated reports
export interface PaginatedReportsOptions {
  urgencyFilter?: number | null;
  statusFilter?: string | null;
  selectedCategories?: string[];
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
}

// Fetch paginated reports with server-side filtering and sorting
export const usePaginatedReports = (
  page: number,
  itemsPerPage: number = 50,
  options?: PaginatedReportsOptions
) => {
  const {
    urgencyFilter,
    statusFilter,
    selectedCategories = [],
    sortColumn = 'updated_at',
    sortDirection = 'desc',
  } = options || {};

  return useQuery({
    queryKey: reportKeys.list({ page, itemsPerPage, ...options }),
    queryFn: async () => {
      const offset = (page - 1) * itemsPerPage;

      // Build query with only needed columns (performance optimization)
      let query = supabase
        .from('reports')
        .select(
          `
          id,
          name,
          lastname,
          reporter_name,
          address,
          phone,
          number_of_adults,
          number_of_children,
          number_of_infants,
          number_of_seniors,
          number_of_patients,
          health_condition,
          help_needed,
          help_categories,
          additional_info,
          urgency_level,
          status,
          created_at,
          updated_at,
          raw_message,
          location_lat,
          location_long,
          map_link,
          line_user_id,
          line_display_name
        `,
          { count: 'exact' }
        );

      // Apply server-side filters (performance: filter at database level)
      if (urgencyFilter !== null && urgencyFilter !== undefined) {
        query = query.eq('urgency_level', urgencyFilter);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      // Apply server-side category filtering using PostgreSQL array overlap operator
      // If categories are selected, use RPC function for optimal performance
      if (selectedCategories.length > 0) {
        // Use PostgreSQL RPC function for efficient array overlap filtering
        // This uses the && operator which is optimized with GIN index
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_paginated_reports_with_categories' as any,
          {
            _page: page,
            _items_per_page: itemsPerPage,
            _urgency_filter: urgencyFilter ?? null,
            _status_filter: statusFilter ?? null,
            _category_filter: selectedCategories.length > 0 ? selectedCategories : null,
            _sort_column: sortColumn || 'updated_at',
            _sort_direction: sortDirection || 'desc',
          }
        );

        if (rpcError) throw rpcError;
        
        // Transform RPC response to match expected format
        const result = rpcData?.[0];
        return {
          data: (result?.data || []) as Report[],
          count: result?.total_count || 0,
        };
      }

      // Apply server-side sorting (performance: sort at database level)
      const orderColumn = sortColumn || 'updated_at';
      const ascending = sortDirection === 'asc';
      
      // Handle different column types for sorting
      if (orderColumn === 'created_at' || orderColumn === 'updated_at') {
        query = query.order(orderColumn, { ascending });
      } else if (orderColumn === 'status') {
        query = query.order(orderColumn, { ascending });
      } else {
        // Numeric columns
        query = query.order(orderColumn, { ascending });
      }

      // Apply pagination
      const { data, error, count } = await query.range(offset, offset + itemsPerPage - 1);

      if (error) throw error;
      return { data: data as Report[], count: count || 0 };
    },
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - cache for 5 minutes
    refetchOnWindowFocus: false, // Disable for paginated queries to reduce unnecessary refetches
    refetchOnReconnect: true,
  });
};

// Fetch all reports for stats/heatmap
export const useAllReports = () => {
  return useQuery({
    queryKey: reportKeys.list({ all: true }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Report[];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Mutation to update report
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Report> }) => {
      const { error } = await supabase
        .from('reports')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reportKeys.counts() });
      queryClient.invalidateQueries({ queryKey: reportKeys.stats() });
    },
  });
};

// Mutation to create report
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Report>) => {
      const { data: result, error } = await supabase
        .from('reports')
        .insert([data as any]) // Type assertion needed due to Partial<Report> vs required fields
        .select()
        .single();

      if (error) throw error;
      return result as Report;
    },
    onSuccess: () => {
      // Invalidate all report queries
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.counts() });
      queryClient.invalidateQueries({ queryKey: reportKeys.stats() });
    },
  });
};

