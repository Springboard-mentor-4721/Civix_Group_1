export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Verification {
  isVerified: boolean;
  status: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  documentType: string | null;
  verifiedAt: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'citizen' | 'official';
  department?: string | null;
  location: Location;
  verification: Verification;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ApiErrorItem[];
}

export interface AuthData {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'citizen' | 'official';
  department?: string;
  phone?: string;
  location?: Partial<Location>;
  verification?: {
    documentType?: string;
  };
}

export type AuthResponse = ApiSuccess<AuthData>;
export type UserResponse = ApiSuccess<{ user: User }>;

export interface DashboardStats {
  myPetitions: number;
  successfulPetitions: number;
  pollsParticipated: number;
  activePetitionsNearYou: number;
  petitionsPendingReview: number;
  resolvedGrievances: number;
  activeMunicipalPolls: number;
  incomingPetitionsForDepartmentReview: number;
}

export type DashboardResponse = ApiSuccess<{ stats: DashboardStats }>;
