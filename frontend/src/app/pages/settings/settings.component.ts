import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  passwordPayload = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCurrent: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get isMinLengthMet(): boolean {
    return this.passwordPayload.newPassword.length >= 6;
  }

  get doPasswordsMatch(): boolean {
    return (
      Boolean(this.passwordPayload.newPassword) &&
      this.passwordPayload.newPassword === this.passwordPayload.confirmPassword
    );
  }

  onChangePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.passwordPayload.currentPassword || !this.passwordPayload.newPassword) {
      this.errorMessage = 'Please complete all password fields.';
      return;
    }

    if (!this.isMinLengthMet) {
      this.errorMessage = 'New password must contain at least 6 characters.';
      return;
    }

    if (!this.doPasswordsMatch) {
      this.errorMessage = 'The password confirmation does not match.';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService
      .changePassword({
        currentPassword: this.passwordPayload.currentPassword,
        newPassword: this.passwordPayload.newPassword
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Your password has been securely updated.';
          this.passwordPayload = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.error?.message ||
            'Unable to change password. Please check your current password and try again.';
          this.cdr.detectChanges();
        }
      });
  }
}

export { SettingsComponent as Settings };