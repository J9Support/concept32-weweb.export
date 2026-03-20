// =============================================================================
// Concept 32 Client Portal - Database Types
// =============================================================================

// -----------------------------------------------------------------------------
// Utility / Enum Types
// -----------------------------------------------------------------------------

export type UserType = 'customer' | 'employee';

export type InspirationCategory = 'Kitchen' | 'Bathroom' | 'Office' | 'Living' | null;

/** Default value: 'Pending' */
export type ProjectStatus = string;

// -----------------------------------------------------------------------------
// Table Row Types
// -----------------------------------------------------------------------------

export interface Profile {
  id: number;
  created_at: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  profile_pic_url: string | null;
  contact_id: number | null;
  user_id: string;
  employee_id: number | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  user_type: UserType;
}

export interface Contact {
  id: number;
  created_at: string;
  ghl_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  phone_raw_format: string | null;
  company_name: string | null;
  full_address: string | null;
  address_1: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  timezone: string | null;
  dob: string | null;
  source: string | null;
  contact_type: string | null;
  website: string | null;
  project_details: string | null;
  referral_name: string | null;
  referral_city: string | null;
  referral_email: string | null;
  referral_phone: string | null;
  referrer_name: string | null;
  postal_code: string | null;
  company_id: number | null;
}

export interface Project {
  id: number;
  created_at: string;
  name: string | null;
  pipeline_name: string | null;
  stage_name: string | null;
  status: ProjectStatus;
  value: number | null;
  source: string | null;
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  ghl_id: string | null;
  profile_id: number | null;
  thumbnail_url: string | null;
  description: string | null;
  progress: number | null;
  step: number | null;
  estimated_step_finish_date: string | null;
  step_name: string | null;
  stage_id: string | null;
  project_files_bucket: string | null;
  project_manager_id: number | null;
}

export interface ProjectStage {
  id: number;
  created_at: string;
  project_stage_id: string | null;
  stage_number: number | null;
  stage_name: string | null;
  description: string | null;
  /** NOTE: Column name contains a typo in the database (missing 't' in "estimated"). */
  estimaed_days: string | null;
  project_id: number | null;
  project_status: ProjectStatus;
}

export interface ProjectUpdate {
  id: number;
  created_at: string;
  message: string | null;
  title: string | null;
  read: boolean;
  project_id: number | null;
  /** NOTE: Column name uses a capital 'L' in the database. */
  Last_update: string | null;
}

export interface ProjectMessage {
  id: number;
  /** NOTE: Column name contains a typo in the database (missing 'e' in "timestamp"). */
  timpstamp: string;
  senderId: number | null;
  /** NOTE: Column name contains a typo in the database ('ie' instead of 'ei' in "receiverId"). */
  recieverId: number | null;
  text: string | null;
  project_id: number | null;
}

export interface ProjectDocument {
  id: number;
  created_at: string;
  url: string | null;
  title: string | null;
  description: string | null;
  project_id: number | null;
}

export interface InspirationPost {
  id: number;
  created_at: string;
  url: string | null;
  uploaded_by_id: string | null;
  type: string | null;
  title: string | null;
  description: string | null;
}

export interface FavoritedPost {
  id: number;
  created_at: string;
  post_id: number | null;
  profile_id: number | null;
}

export interface ProjectPost {
  id: number;
  created_at: string;
  post_id: number | null;
  project_id: number | null;
}

export interface Invoice {
  id: number;
  created_at: string;
  status: string | null;
  contact_name: string | null;
  currency: string | null;
  due_date: string | null;
  discount_value: string | null;
  issue_date: string | null;
  sender_name: string | null;
  sender_email: string | null;
  subtotal: number | null;
  total_discount_price: number | null;
  invoice_number: string | null;
  total_price: number | null;
  url: string | null;
  name: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  discount_amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  title: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  opportunity_id: string | null;
  project_ghl_id: string | null;
  project_id: number | null;
}

export interface Employee {
  id: number;
  created_at: string;
  email: string;
  display_name: string | null;
}

export interface Company {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface ProjectCompany {
  id: number;
  project_id: number | null;
  company_id: number | null;
}

export interface Role {
  id: number;
  created_at: string;
  key: string | null;
  name: string | null;
  level: number | null;
}

export interface UserRole {
  user_id: string;
  role_id: number | null;
  granted_at: string | null;
  granted_by: number | null;
}

// -----------------------------------------------------------------------------
// Database Map
// -----------------------------------------------------------------------------

export interface Database {
  profiles: Profile;
  contacts: Contact;
  projects: Project;
  project_stages: ProjectStage;
  project_updates: ProjectUpdate;
  project_messages: ProjectMessage;
  project_documents: ProjectDocument;
  inspiration_posts: InspirationPost;
  favorited_posts: FavoritedPost;
  projects_posts: ProjectPost;
  invoices: Invoice;
  employees: Employee;
  companies: Company;
  project_companies: ProjectCompany;
  roles: Role;
  user_roles: UserRole;
}
