import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/api.models';

const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'civix_token';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  private getAuthOptions() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  // Original stats method
  getStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${API_BASE_URL}/dashboard/stats`, this.getAuthOptions());
  }

  // Official locality-filtered petitions
  getLocalityPetitions(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] && params[key] !== 'All Categories') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<any>(`${API_BASE_URL}/official/petitions`, {
      ...this.getAuthOptions(),
      params: httpParams
    });
  }

  // Citizen general petition feed
  getPetitions(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] && params[key] !== 'All Categories') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<any>(`${API_BASE_URL}/petitions`, {
      ...this.getAuthOptions(),
      params: httpParams
    });
  }

  // Official response and status update
  respondToPetition(
    petitionId: string,
    payload: {
      comment: string;
      status: 'under_review' | 'closed' | 'active';
    }
  ): Observable<any> {
    return this.http.post<any>(
      `${API_BASE_URL}/official/petitions/${petitionId}/response`,
      payload,
      this.getAuthOptions()
    );
  }

  // Monthly Civic Engagement Report (JSON)
  getMonthlyReport(month?: number, year?: number, city?: string): Observable<any> {
    let httpParams = new HttpParams();
    if (month) httpParams = httpParams.set('month', month.toString());
    if (year) httpParams = httpParams.set('year', year.toString());
    if (city) httpParams = httpParams.set('city', city);

    return this.http.get<any>(`${API_BASE_URL}/reports/monthly`, {
      ...this.getAuthOptions(),
      params: httpParams
    });
  }

  // Monthly Civic Engagement CSV Export (RFC-4180 Blob)
  exportMonthlyReportCsv(month?: number, year?: number, city?: string): Observable<Blob> {
    let httpParams = new HttpParams();
    if (month) httpParams = httpParams.set('month', month.toString());
    if (year) httpParams = httpParams.set('year', year.toString());
    if (city) httpParams = httpParams.set('city', city);

    return this.http.get(`${API_BASE_URL}/reports/monthly/export`, {
      ...this.getAuthOptions(),
      params: httpParams,
      responseType: 'blob'
    });
  }
}