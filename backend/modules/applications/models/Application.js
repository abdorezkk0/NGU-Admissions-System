/**
 * Application Model Schema (Supabase)
 * 
 * This file documents the application data structure.
 * Actual storage is handled by Supabase PostgreSQL.
 */

const ApplicationSchema = {
  // Primary Key
  id: 'UUID',
  user_id: 'UUID (Foreign Key -> auth.users)',
  
  // Status
  status: 'TEXT (draft | submitted | under_review | pending_documents | accepted | rejected | withdrawn)',
  
  // Personal Information
  first_name: 'TEXT',
  last_name: 'TEXT',
  email: 'TEXT',
  phone_number: 'TEXT',
  date_of_birth: 'DATE',
  gender: 'TEXT (male | female | other)',
  nationality: 'TEXT',
  national_id: 'TEXT',
  
  // Address
  address_line1: 'TEXT',
  address_line2: 'TEXT',
  city: 'TEXT',
  state: 'TEXT',
  postal_code: 'TEXT',
  country: 'TEXT',
  
  // Academic Information
  program_id: 'UUID (Foreign Key -> programs)',
  entry_year: 'INTEGER',
  entry_semester: 'TEXT (fall | spring | summer)',
  
  // Previous Education
  high_school_name: 'TEXT',
  high_school_graduation_year: 'INTEGER',
  high_school_gpa: 'DECIMAL(3,2)',
  high_school_country: 'TEXT',
  
  // Eligibility
  eligibility_score: 'DECIMAL(5,2)',
  eligibility_status: 'TEXT (eligible | not_eligible | pending)',
  
  // Decision
  decision: 'TEXT (pending | accepted | rejected | waitlisted)',
  decision_date: 'TIMESTAMPTZ',
  decision_by: 'UUID (Foreign Key -> auth.users)',
  decision_notes: 'TEXT',
  
  // Metadata
  submitted_at: 'TIMESTAMPTZ',
  reviewed_at: 'TIMESTAMPTZ',
  reviewed_by: 'UUID (Foreign Key -> auth.users)',
  created_at: 'TIMESTAMPTZ',
  updated_at: 'TIMESTAMPTZ',
};

// Valid status transitions
const StatusTransitions = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['under_review', 'withdrawn'],
  under_review: ['pending_documents', 'accepted', 'rejected'],
  pending_documents: ['under_review', 'withdrawn'],
  accepted: [], // final state
  rejected: [], // final state
  withdrawn: [], // final state
};

module.exports = {
  ApplicationSchema,
  StatusTransitions,
};