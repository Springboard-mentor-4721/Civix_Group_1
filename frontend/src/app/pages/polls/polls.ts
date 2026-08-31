import { Component } from '@angular/core';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  description: string;
  category: string;
  location: string;
  createdBy: string;
  closesOn: string;
  totalVotes: number;
  status: 'ACTIVE' | 'CLOSED';
  options: PollOption[];
}

@Component({
  selector: 'app-polls',
  imports: [],
  templateUrl: './polls.component.html',
  styleUrl: './polls.component.css',
})
export class Polls {
  activeTab = 'active';

  selectedLocation = 'All Locations';
  selectedCategory = 'All Categories';

  selectedOptions: { [question: string]: string } = {};

  showCreateModal = false;

  categories = [
    'All Categories',
    'Transportation',
    'Public Works',
    'Recreation',
    'Education',
    'Environment',
    'Infrastructure'
  ];

  locations = [
    'All Locations',
    'Delhi',
    'Mumbai',
    'Nagpur',
    'Pune'
  ];

  polls: Poll[] = [
    {
      question: 'Should the city add more public transport buses?',
      description:
        'Share your opinion on improving public transportation and reducing waiting times.',
      category: 'Transportation',
      location: 'Delhi',
      createdBy: 'Community Member',
      closesOn: '15 Sep 2026',
      totalVotes: 124,
      status: 'ACTIVE',
      options: [
        { text: 'Yes, definitely', votes: 76 },
        { text: 'Maybe', votes: 31 },
        { text: 'No', votes: 17 }
      ]
    },
    {
      question: 'Should more green spaces be created in residential areas?',
      description:
        'Help the community decide whether unused public areas should become green spaces.',
      category: 'Environment',
      location: 'Nagpur',
      createdBy: 'Community Member',
      closesOn: '20 Sep 2026',
      totalVotes: 86,
      status: 'ACTIVE',
      options: [
        { text: 'Yes', votes: 58 },
        { text: 'No', votes: 18 },
        { text: 'Not sure', votes: 10 }
      ]
    },
    {
      question: 'Which improvement should receive priority?',
      description:
        'Choose the area that you believe needs the most immediate attention.',
      category: 'Infrastructure',
      location: 'Pune',
      createdBy: 'Community Member',
      closesOn: '30 Aug 2026',
      totalVotes: 142,
      status: 'CLOSED',
      options: [
        { text: 'Roads', votes: 61 },
        { text: 'Street Lighting', votes: 49 },
        { text: 'Footpaths', votes: 32 }
      ]
    }
  ];

  get filteredPolls(): Poll[] {
    return this.polls.filter(poll => {
      const matchesTab =
        this.activeTab === 'active'
          ? poll.status === 'ACTIVE'
          : this.activeTab === 'closed'
            ? poll.status === 'CLOSED'
            : true;

      const matchesLocation =
        this.selectedLocation === 'All Locations' ||
        poll.location === this.selectedLocation;

      const matchesCategory =
        this.selectedCategory === 'All Categories' ||
        poll.category === this.selectedCategory;

      return matchesTab && matchesLocation && matchesCategory;
    });
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  selectOption(poll: Poll, option: PollOption): void {
    if (poll.status === 'CLOSED') {
      return;
    }

    this.selectedOptions[poll.question] = option.text;
  }

  submitVote(poll: Poll): void {
    const selected = this.selectedOptions[poll.question];

    if (!selected) {
      alert('Please select an option first.');
      return;
    }

    const option = poll.options.find(item => item.text === selected);

    if (option) {
      option.votes++;
      poll.totalVotes++;
    }

    alert('Your vote has been recorded.');
  }

  getPercentage(option: PollOption, poll: Poll): number {
    if (poll.totalVotes === 0) {
      return 0;
    }

    return Math.round((option.votes / poll.totalVotes) * 100);
  }

  openCreatePoll(): void {
    this.showCreateModal = true;
  }

  closeCreatePoll(): void {
    this.showCreateModal = false;
  }

  clearFilters(): void {
    this.selectedLocation = 'All Locations';
    this.selectedCategory = 'All Categories';
  }
}