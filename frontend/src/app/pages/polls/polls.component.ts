import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PollService, Poll, CreatePollRequest } from '../../services/poll.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './polls.component.html',
  styleUrl: './polls.component.css'
})
export class PollsComponent implements OnInit {
  private pollService = inject(PollService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  polls: Poll[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  showAddPoll = false;
  search = '';
  selectedCategory = '';

  currentView: 'active' | 'closed' = 'active'; 

  categories = [
    'Infrastructure', 'Environment', 'Public Safety', 'Health',
    'Education', 'Transportation', 'Sanitation', 'Governance', 'Other'
  ];

  formOptions: { text: string }[] = [{ text: '' }, { text: '' }];

  newPoll: CreatePollRequest = {
    title: '', description: '', category: '', options: [],
    location: { address: '', city: '', state: '', pincode: '', latitude: null, longitude: null },
    endDate: null, relatedPetition: null, status: 'active'
  };

  // Restricts certain UI elements based on user role
  get isOfficial(): boolean {
    return this.authService.currentUser()?.role === 'official';
  }

  ngOnInit(): void {
    this.loadPolls();
  }

  switchView(view: 'active' | 'closed'): void {
    this.currentView = view;
    this.loadPolls();
  }

  loadPolls(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.pollService.getPolls({
      search: this.search,
      category: this.selectedCategory,
      status: this.currentView,
      page: 1,
      limit: 20
    }).subscribe({
      next: (response) => {
        this.polls = [...(response?.data?.polls || [])];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load polls:', error);
        this.errorMessage = 'Unable to load polls.';
      }
    }).add(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  getPercentage(votes: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((votes / total) * 100);
  }

  toggleAddPoll(): void {
    this.showAddPoll = !this.showAddPoll;
    this.successMessage = '';
    this.errorMessage = '';
  }

  addOption(): void {
    this.formOptions.push({ text: '' });
  }

  removeOption(index: number): void {
    if (this.formOptions.length > 2) {
      this.formOptions.splice(index, 1);
    }
  }

  createPoll(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const validOptions = this.formOptions
      .map(opt => (opt.text || '').trim())
      .filter(text => text.length > 0);

    const safeTitle = (this.newPoll.title || '').trim();
    const safeCity = (this.newPoll.location.city || '').trim();
    const safeState = (this.newPoll.location.state || '').trim();

    if (!safeTitle) { this.errorMessage = 'Please enter a poll title.'; return; }
    if (!this.newPoll.category) { this.errorMessage = 'Please select a category.'; return; }
    if (validOptions.length < 2) { this.errorMessage = 'A poll must have at least 2 options.'; return; }
    if (!safeCity || !safeState) { this.errorMessage = 'City and state are required.'; return; }

    const pollData: CreatePollRequest = {
      ...this.newPoll,
      title: safeTitle,
      description: (this.newPoll.description || '').trim(),
      options: validOptions 
    };

    this.submitting = true;
    this.pollService.createPoll(pollData).subscribe({
      next: () => {
        this.successMessage = 'Poll created successfully!';
        this.resetForm();
        this.showAddPoll = false; 
        this.loadPolls();
      },
      error: (error) => {
        console.error('Failed to create poll:', error);
        this.errorMessage = error?.error?.message || 'Failed to create poll.';
      }
    }).add(() => {
      this.submitting = false;
      this.cdr.detectChanges();
    });
  }

  resetForm(): void {
    this.formOptions = [{ text: '' }, { text: '' }];
    this.newPoll = {
      title: '', description: '', category: '', options: [],
      location: { address: '', city: '', state: '', pincode: '', latitude: null, longitude: null },
      endDate: null, relatedPetition: null, status: 'active'
    };
  }

  vote(poll: Poll, optionId: string): void {
    if (!optionId) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.pollService.votePoll(poll._id, optionId).subscribe({
      next: () => {
        this.successMessage = 'Vote submitted successfully!';
        this.loadPolls();
      },
      error: (error) => {
        console.error('Vote failed:', error);
        this.errorMessage = error?.error?.message || 'Unable to submit vote.';
      }
    });
  }

  canClosePoll(poll: Poll): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    if (user.role === 'official') return true;
    const creatorId = typeof poll.createdBy === 'object' ? poll.createdBy?._id : poll.createdBy;
    return creatorId === user._id;
  }

  closePoll(poll: Poll): void {
    if (!confirm(`Are you sure you want to close the poll "${poll.title}"?`)) return;

    this.submitting = true;
    this.pollService.updatePollStatus(poll._id, 'closed').subscribe({
      next: () => {
        this.successMessage = `Poll "${poll.title}" closed successfully.`;
        this.loadPolls();
      },
      error: (err) => {
        console.error('Failed to close poll:', err);
        this.errorMessage = err?.error?.message || 'Failed to close poll.';
      }
    }).add(() => {
      this.submitting = false;
      this.cdr.detectChanges();
    });
  }
}