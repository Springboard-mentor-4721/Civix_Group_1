import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { Petitions } from './pages/petitions/petitions.component';
import { PollsComponent } from './pages/polls/polls.component';
import { Officials } from './pages/officials/officials';
import { Reports } from './pages/reports/reports.component';
import { Settings } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  { path: 'petitions', component: Petitions, canActivate: [authGuard] },

  { path: 'polls', component: PollsComponent, canActivate: [authGuard] },

  { path: 'officials', component: Officials, canActivate: [authGuard] },

  { path: 'reports', component: Reports, canActivate: [authGuard] },

  { path: 'settings', component: Settings, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];