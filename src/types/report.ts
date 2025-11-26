export interface Report {
  id: string
  name: string
  lastname: string
  reporter_name: string
  address: string
  phone: string[]
  number_of_adults: number
  number_of_children: number
  number_of_infants: number
  number_of_seniors: number
  number_of_patients: number
  health_condition: string
  help_needed: string
  help_categories: string[]
  additional_info: string
  urgency_level: number
  status: string
  created_at: string
  updated_at: string
  raw_message: string
  location_lat: number | null
  location_long: number | null
  map_link: string | null
  line_user_id: string | null
  line_display_name: string | null
}
