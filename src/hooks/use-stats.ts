import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { reportKeys } from './use-reports';

interface StatsData {
  total: number;
  totalPeople: number;
  critical: number;
  high: number;
  needsAttention: number;
  pending: number;
  processed: number;
  completed: number;
  adults: number;
  children: number;
  infants: number;
  seniors: number;
  patients: number;
  urgencyLevel1: number;
  urgencyLevel2: number;
  urgencyLevel3: number;
  urgencyLevel4: number;
  urgencyLevel5: number;
}

interface LandingStats {
  totalReports: number;
  helpedCount: number;
  urgentCount: number;
}

// Fetch comprehensive stats
export const useStats = () => {
  return useQuery({
    queryKey: reportKeys.stats(),
    queryFn: async (): Promise<StatsData> => {
      // Fetch aggregated statistics using multiple queries in parallel
      const [
        { count: total },
        { data: statusCounts },
        { data: urgencyCounts },
        { data: peopleData },
      ] = await Promise.all([
        // Total count
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        // Status counts
        supabase.from('reports').select('status'),
        // Urgency level counts
        supabase.from('reports').select('urgency_level'),
        // People counts
        supabase
          .from('reports')
          .select('number_of_adults, number_of_children, number_of_infants, number_of_seniors, number_of_patients'),
      ]);

      // Calculate status counts
      const statusCountMap = (statusCounts || []).reduce(
        (acc: Record<string, number>, r: { status: string | null }) => {
          const status = r.status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {}
      );

      // Calculate urgency counts
      const urgencyCountMap = (urgencyCounts || []).reduce(
        (acc: Record<number, number>, r: { urgency_level: number }) => {
          acc[r.urgency_level] = (acc[r.urgency_level] || 0) + 1;
          return acc;
        },
        {}
      );

      // Calculate people stats
      const calculatedStats = (peopleData || []).reduce(
        (acc, r) => ({
          adults: acc.adults + (r.number_of_adults || 0),
          children: acc.children + (r.number_of_children || 0),
          infants: acc.infants + (r.number_of_infants || 0),
          seniors: acc.seniors + (r.number_of_seniors || 0),
          patients: acc.patients + (r.number_of_patients || 0),
        }),
        { adults: 0, children: 0, infants: 0, seniors: 0, patients: 0 }
      );

      const totalPeople =
        calculatedStats.adults +
        calculatedStats.children +
        calculatedStats.infants +
        calculatedStats.seniors;

      return {
        total: total || 0,
        totalPeople,
        critical: (urgencyCountMap[4] || 0) + (urgencyCountMap[5] || 0),
        high: urgencyCountMap[3] || 0,
        needsAttention: (urgencyCountMap[3] || 0) + (urgencyCountMap[4] || 0) + (urgencyCountMap[5] || 0),
        pending: statusCountMap['pending'] || 0,
        processed: statusCountMap['processed'] || 0,
        completed: statusCountMap['completed'] || 0,
        adults: calculatedStats.adults,
        children: calculatedStats.children,
        infants: calculatedStats.infants,
        seniors: calculatedStats.seniors,
        patients: calculatedStats.patients,
        urgencyLevel1: urgencyCountMap[1] || 0,
        urgencyLevel2: urgencyCountMap[2] || 0,
        urgencyLevel3: urgencyCountMap[3] || 0,
        urgencyLevel4: urgencyCountMap[4] || 0,
        urgencyLevel5: urgencyCountMap[5] || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Fetch landing page stats
export const useLandingStats = () => {
  return useQuery({
    queryKey: [...reportKeys.stats(), 'landing'],
    queryFn: async (): Promise<LandingStats> => {
      // Run queries in parallel for better performance
      const [totalResult, helpedResult, urgentResult] = await Promise.all([
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .gte('urgency_level', 4),
      ]);

      return {
        totalReports: totalResult.count || 0,
        helpedCount: helpedResult.count || 0,
        urgentCount: urgentResult.count || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

