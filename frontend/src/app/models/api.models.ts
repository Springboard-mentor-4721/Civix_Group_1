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
  role: 'citizen' | 'official';
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
  location?: Partial<Location>;
  verification?: {
    documentType?: string;
  };
}

export type AuthResponse = ApiSuccess<AuthData>;
export type UserResponse = ApiSuccess<{ user: User }>;
