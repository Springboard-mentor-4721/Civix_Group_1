import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiError, RegisterPayload } from '../../models/api.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  readonly departmentList: string[] = [
    'Municipal Corporation',
    'Public Works',
    'Transportation',
    'Education',
    'Health',
    'Environment',
    'Sanitation & Waste Management',
    'Water Supply & Sewage',
    'Urban Development',
    'General Administration'
  ];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['citizen' as 'citizen' | 'official', Validators.required],
    department: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: [''],
    address: [''],
    latitude: [''],
    longitude: ['']
  });

  constructor() {
    this.form.controls.role.valueChanges.subscribe((role) => {
      if (role === 'official') {
        this.form.controls.department.setValidators([Validators.required]);
      } else {
        this.form.controls.department.clearValidators();
        this.form.controls.department.setValue('');
      }
      this.form.controls.department.updateValueAndValidity();
    });
  }

  loading = false;
  detectingLocation = false;
  serverMessage = '';
  fieldErrors: Record<string, string> = {};

  autoDetectLocation(): void {
    if (!('geolocation' in navigator)) {
      this.serverMessage = 'Unable to detect your location. Please enter it manually.';
      return;
    }
    this.detectingLocation = true;
    this.serverMessage = '';
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const address = data?.address ?? {};
          const city = address.city || address.town || address.village || address.county || '';
          const state = address.state || address.state_district || '';
          const pincode = address.postcode || '';
          this.form.patchValue({
            city,
            state,
            pincode,
            address: data?.display_name || '',
            latitude: String(latitude),
            longitude: String(longitude)
          });
        } catch {
          this.serverMessage = 'Unable to detect your location. Please enter it manually.';
        } finally {
          this.detectingLocation = false;
        }
      },
      () => {
        this.detectingLocation = false;
        this.serverMessage = 'Unable to detect your location. Please enter it manually.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  submit(): void {
    this.serverMessage = '';
    this.fieldErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: RegisterPayload = {
      name: value.name,
      email: value.email,
      password: value.password,
      role: value.role,
      department: value.role === 'official' ? value.department : undefined,
      location: {
        address: value.address,
        city: value.city,
        state: value.state,
        pincode: value.pincode,
        latitude: value.latitude === '' ? null : Number(value.latitude),
        longitude: value.longitude === '' ? null : Number(value.longitude)
      }
    };
    this.loading = true;
    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (error: ApiError) => this.showError(error),
      complete: () => {
        this.loading = false;
      }
    });
  }

  private showError(error: ApiError): void {
    this.loading = false;
    this.serverMessage = error.message || 'Unable to create your account.';
    for (const item of error.errors ?? []) {
      if (item.field) this.fieldErrors[item.field] = item.message;
    }
  }
}