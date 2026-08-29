import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { AuthData, AuthResponse, RegisterPayload, User, UserResponse } from '../models/api.models';

export const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'civix_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly restoringSignal = signal(true);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = () => this.currentUserSignal() !== null;
  readonly isRestoring = this.restoringSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload).pipe(
      tap(({ data }) => this.establishSession(data)),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password }).pipe(
      tap(({ data }) => this.establishSession(data)),
    );
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${API_BASE_URL}/auth/me`).pipe(
      tap(({ data }) => this.currentUserSignal.set(data.user)),
    );
  }

  // Alias for compatibility
  getProfile(): Observable<UserResponse> {
    return this.getCurrentUser();
  }

  restoreSession(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      this.restoringSignal.set(false);
      return of(null);
    }

    return this.getCurrentUser().pipe(
      map(({ data }) => data.user),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      tap(() => this.restoringSignal.set(false)),
      finalize(() => this.restoringSignal.set(false)),
    );
  }

  logout(): void {
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private establishSession(data: AuthData): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    this.currentUserSignal.set(data.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
  }
}