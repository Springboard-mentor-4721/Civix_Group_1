import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PollOption {
  _id?: string;
  text: string;
  votesCount?: number;
  percentage?: number;
}

export interface PollLocation {
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Poll {
  _id: string;
  title: string;
  description: string;
  category: string;
  options: PollOption[];
  location: PollLocation;
  totalVotes: number;
  status: 'active' | 'closed';
  startDate: string;
  endDate?: string | null;
  createdBy?: any;
  relatedPetition?: any;
  createdAt?: string;
}

export interface CreatePollRequest {
  title: string;
  description: string;
  category: string;
  options: string[];
  location: PollLocation;
  endDate?: string | null;
  relatedPetition?: string | null;
  status?: 'active' | 'closed';
}

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/polls';

  getPolls(params?: {
    search?: string;
    category?: string;
    city?: string;
    state?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  createPoll(poll: CreatePollRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, poll);
  }

  getPollById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  votePoll(id: string, optionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/vote`, { optionId });
  }

  getPollResults(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/results`);
  }
}