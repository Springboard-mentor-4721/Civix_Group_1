import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiError, RegisterPayload } from '../../models/api.models';

@Component({ selector: 'app-register', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './register.component.html', styleUrl: './register.component.css' })
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);
  readonly form = this.formBuilder.nonNullable.group({ name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]], role: ['citizen' as 'citizen' | 'official', Validators.required], city: ['', Validators.required], state: ['', Validators.required], pincode: [''], address: [''], latitude: [''], longitude: [''], documentType: [''] });
  loading = false; detectingLocation = false; serverMessage = ''; fieldErrors: Record<string, string> = {};

  autoDetectLocation(): void {
    this.detectingLocation = true;
    this.http.get<any>('http://ip-api.com/json').subscribe({
      next: (res) => {
        if (res?.status === 'success') this.form.patchValue({ city: res.city || '', state: res.regionName || '', pincode: res.zip || '', latitude: res.lat ? String(res.lat) : '', longitude: res.lon ? String(res.lon) : '' });
        this.detectingLocation = false;
      },
      error: () => { this.detectingLocation = false; }
    });
  }

  submit(): void {
    this.serverMessage = ''; this.fieldErrors = {};
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const payload: RegisterPayload = { name: value.name, email: value.email, password: value.password, role: value.role, location: { address: value.address, city: value.city, state: value.state, pincode: value.pincode, latitude: value.latitude === '' ? null : Number(value.latitude), longitude: value.longitude === '' ? null : Number(value.longitude) } };
    if (value.documentType) payload.verification = { documentType: value.documentType };
    this.loading = true;
    this.auth.register(payload).subscribe({ next: () => this.router.navigate(['/profile']), error: (error: ApiError) => this.showError(error), complete: () => { this.loading = false; } });
  }

  private showError(error: ApiError): void { this.loading = false; this.serverMessage = error.message || 'Unable to create your account.'; for (const item of error.errors ?? []) if (item.field) this.fieldErrors[item.field] = item.message; }
}