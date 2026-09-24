import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-settings', imports: [FormsModule], templateUrl: './settings.component.html', styleUrl: './settings.component.css' })
export class Settings {
  private readonly auth = inject(AuthService);

  fullName = 'Civix User'; email = 'user@civix.org'; phone = ''; city = 'Delhi'; state = 'Delhi';
  emailNotifications = true; pollNotifications = true; petitionNotifications = true; reportNotifications = true; privateAccount = false;
  currentPassword = ''; newPassword = ''; confirmPassword = ''; passwordMessage = ''; passwordError = false; passwordLoading = false;

  saveChanges(): void { alert('Settings saved successfully.'); }

  updatePassword(): void {
    this.passwordMessage = ''; this.passwordError = false;
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) { this.passwordError = true; this.passwordMessage = 'Please fill out all password fields.'; return; }
    if (this.newPassword.length < 6) { this.passwordError = true; this.passwordMessage = 'New password must be at least 6 characters.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passwordError = true; this.passwordMessage = 'New passwords do not match.'; return; }

    this.passwordLoading = true;
    this.auth.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordError = false;
        this.passwordMessage = 'Password changed successfully.';
        this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = '';
      },
      error: (err: any) => {
        this.passwordLoading = false;
        this.passwordError = true;
        this.passwordMessage = err?.error?.message || 'Failed to update password.';
      }
    });
  }

  resetChanges(): void {
    this.fullName = 'Civix User'; this.email = 'user@civix.org'; this.phone = ''; this.city = 'Delhi'; this.state = 'Delhi';
    this.emailNotifications = true; this.pollNotifications = true; this.petitionNotifications = true; this.reportNotifications = true; this.privateAccount = false;
    this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.passwordMessage = ''; this.passwordError = false;
  }
}