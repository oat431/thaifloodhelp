-- Create GIN index for help_categories array for faster filtering
-- GIN indexes are optimized for array operations like overlap (&&)
CREATE INDEX IF NOT EXISTS idx_reports_help_categories 
ON public.reports 
USING gin(help_categories);

COMMENT ON INDEX idx_reports_help_categories IS 
'GIN index for help_categories array to optimize category filtering queries';

-- Create a function to get paginated reports with category filtering
-- This function uses PostgreSQL's array overlap operator (&&) for efficient filtering
CREATE OR REPLACE FUNCTION public.get_paginated_reports_with_categories(
  _page integer DEFAULT 1,
  _items_per_page integer DEFAULT 50,
  _urgency_filter integer DEFAULT NULL,
  _status_filter text DEFAULT NULL,
  _category_filter text[] DEFAULT NULL,
  _sort_column text DEFAULT 'updated_at',
  _sort_direction text DEFAULT 'desc'
)
RETURNS TABLE (
  data json,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _offset integer;
  _total_count bigint;
BEGIN
  _offset := (_page - 1) * _items_per_page;
  
  -- Get total count with filters applied
  SELECT COUNT(*) INTO _total_count
  FROM public.reports r
  WHERE (_urgency_filter IS NULL OR r.urgency_level = _urgency_filter)
    AND (_status_filter IS NULL OR r.status = _status_filter)
    AND (_category_filter IS NULL OR r.help_categories && _category_filter);
  
  -- Return paginated data with filters
  RETURN QUERY
  SELECT 
    json_agg(
      json_build_object(
        'id', r.id,
        'name', r.name,
        'lastname', r.lastname,
        'reporter_name', r.reporter_name,
        'address', r.address,
        'phone', r.phone,
        'number_of_adults', r.number_of_adults,
        'number_of_children', r.number_of_children,
        'number_of_infants', r.number_of_infants,
        'number_of_seniors', r.number_of_seniors,
        'number_of_patients', r.number_of_patients,
        'health_condition', r.health_condition,
        'help_needed', r.help_needed,
        'help_categories', r.help_categories,
        'additional_info', r.additional_info,
        'urgency_level', r.urgency_level,
        'status', r.status,
        'created_at', r.created_at,
        'updated_at', r.updated_at,
        'raw_message', r.raw_message,
        'location_lat', r.location_lat,
        'location_long', r.location_long,
        'map_link', r.map_link,
        'line_user_id', r.line_user_id,
        'line_display_name', r.line_display_name
      )
    ) as data,
    _total_count as total_count
  FROM (
    SELECT *
    FROM public.reports r
    WHERE (_urgency_filter IS NULL OR r.urgency_level = _urgency_filter)
      AND (_status_filter IS NULL OR r.status = _status_filter)
      AND (_category_filter IS NULL OR r.help_categories && _category_filter)
    ORDER BY 
      CASE WHEN _sort_column = 'created_at' AND _sort_direction = 'asc' THEN r.created_at END ASC,
      CASE WHEN _sort_column = 'created_at' AND _sort_direction = 'desc' THEN r.created_at END DESC,
      CASE WHEN _sort_column = 'updated_at' AND _sort_direction = 'asc' THEN r.updated_at END ASC,
      CASE WHEN _sort_column = 'updated_at' AND _sort_direction = 'desc' THEN r.updated_at END DESC,
      CASE WHEN _sort_column = 'status' AND _sort_direction = 'asc' THEN r.status END ASC,
      CASE WHEN _sort_column = 'status' AND _sort_direction = 'desc' THEN r.status END DESC,
      CASE WHEN _sort_column = 'urgency_level' AND _sort_direction = 'asc' THEN r.urgency_level END ASC,
      CASE WHEN _sort_column = 'urgency_level' AND _sort_direction = 'desc' THEN r.urgency_level END DESC,
      CASE WHEN _sort_column = 'number_of_adults' AND _sort_direction = 'asc' THEN r.number_of_adults END ASC,
      CASE WHEN _sort_column = 'number_of_adults' AND _sort_direction = 'desc' THEN r.number_of_adults END DESC,
      CASE WHEN _sort_column = 'number_of_children' AND _sort_direction = 'asc' THEN r.number_of_children END ASC,
      CASE WHEN _sort_column = 'number_of_children' AND _sort_direction = 'desc' THEN r.number_of_children END DESC,
      CASE WHEN _sort_column = 'number_of_infants' AND _sort_direction = 'asc' THEN r.number_of_infants END ASC,
      CASE WHEN _sort_column = 'number_of_infants' AND _sort_direction = 'desc' THEN r.number_of_infants END DESC,
      CASE WHEN _sort_column = 'number_of_seniors' AND _sort_direction = 'asc' THEN r.number_of_seniors END ASC,
      CASE WHEN _sort_column = 'number_of_seniors' AND _sort_direction = 'desc' THEN r.number_of_seniors END DESC,
      CASE WHEN _sort_column = 'number_of_patients' AND _sort_direction = 'asc' THEN r.number_of_patients END ASC,
      CASE WHEN _sort_column = 'number_of_patients' AND _sort_direction = 'desc' THEN r.number_of_patients END DESC
    LIMIT _items_per_page
    OFFSET _offset
  ) r;
END;
$$;

COMMENT ON FUNCTION public.get_paginated_reports_with_categories IS 
'Get paginated reports with server-side filtering by urgency, status, and categories. Uses array overlap operator (&&) for efficient category filtering.';

