import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PollService,
  Poll,
  CreatePollRequest
} from '../../services/poll.service';

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './polls.component.html',
  styleUrl: './polls.component.css'
})
export class PollsComponent implements OnInit {

  private pollService = inject(PollService);
  private cdr = inject(ChangeDetectorRef);

  polls: Poll[] = [];

  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  showAddPoll = false;

  search = '';
  selectedCategory = '';

  categories = [
    'Infrastructure',
    'Environment',
    'Public Safety',
    'Health',
    'Education',
    'Transportation',
    'Sanitation',
    'Governance',
    'Other'
  ];

  newPoll: CreatePollRequest = {
    title: '',
    description: '',
    category: '',
    options: ['', ''],
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      latitude: null,
      longitude: null
    },
    endDate: null,
    relatedPetition: null,
    status: 'active'
  };

  ngOnInit(): void {
    this.loadPolls();
  }

  loadPolls(): void {
    this.loading = true;
    this.errorMessage = '';

    this.pollService.getPolls({
      search: this.search,
      category: this.selectedCategory,
      page: 1,
      limit: 20
    }).subscribe({
      next: (response) => {
        this.polls = response?.data?.polls || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load polls:', error);
        this.errorMessage = 'Unable to load polls.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddPoll(): void {
    this.showAddPoll = !this.showAddPoll;
    this.successMessage = '';
    this.errorMessage = '';
  }

  addOption(): void {
    this.newPoll.options.push('');
  }

  trackByIndex(index: number): number {
  return index;
  }

  removeOption(index: number): void {
    if (this.newPoll.options.length > 2) {
      this.newPoll.options.splice(index, 1);
    }
  }

  createPoll(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const validOptions = this.newPoll.options
      .map(option => option.trim())
      .filter(option => option.length > 0);

    if (!this.newPoll.title.trim()) {
      this.errorMessage = 'Please enter a poll title.';
      return;
    }

    if (!this.newPoll.category) {
      this.errorMessage = 'Please select a category.';
      return;
    }

    if (validOptions.length < 2) {
      this.errorMessage = 'A poll must have at least 2 options.';
      return;
    }

    if (
      !this.newPoll.location.city.trim() ||
      !this.newPoll.location.state.trim()
    ) {
      this.errorMessage = 'City and state are required.';
      return;
    }

    const pollData: CreatePollRequest = {
      ...this.newPoll,
      title: this.newPoll.title.trim(),
      description: this.newPoll.description.trim(),
      options: validOptions
    };

    this.submitting = true;

    this.pollService.createPoll(pollData).subscribe({
      next: () => {
        this.successMessage = 'Poll created successfully!';
        this.submitting = false;
        this.showAddPoll = false;

        this.resetForm();
        this.loadPolls();
      },
      error: (error) => {
        console.error('Failed to create poll:', error);

        this.errorMessage =
          error?.error?.message || 'Failed to create poll.';

        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.newPoll = {
      title: '',
      description: '',
      category: '',
      options: ['', ''],
      location: {
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: null,
        longitude: null
      },
      endDate: null,
      relatedPetition: null,
      status: 'active'
    };
  }

  vote(poll: Poll, optionId: string): void {
    if (!optionId) {
      return;
    }

    // Clear previous messages before voting
    this.successMessage = '';
    this.errorMessage = '';

    this.pollService.votePoll(poll._id, optionId).subscribe({
      next: () => {
        this.successMessage = 'Vote submitted successfully!';
        this.loadPolls();
      },
      error: (error) => {
        console.error('Vote failed:', error);
        this.errorMessage =
          error?.error?.message || 'Unable to submit vote.';
        this.cdr.detectChanges();
      }
    });
  }
}