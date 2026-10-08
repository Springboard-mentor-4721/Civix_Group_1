const mongoose = require('mongoose');

const validCategories = [
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

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    minlength: [1, 'Option text cannot be empty'],
    maxlength: [200, 'Option text cannot exceed 200 characters']
  },
  votesCount: {
    type: Number,
    default: 0,
    min: 0
  }
});

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: validCategories,
        message: 'Invalid category. Must be one of the supported categories'
      }
    },
    location: {
      address: { type: String, default: '', trim: true },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      pincode: { type: String, default: '', trim: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },
    options: {
      type: [optionSchema],
      validate: [
        {
          validator: function (opts) {
            return Array.isArray(opts) && opts.length >= 2;
          },
          message: 'A poll must contain at least 2 options'
        }
      ]
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'closed'],
        message: 'Invalid poll status. Must be either active or closed'
      },
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    relatedPetition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Petition',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for optimized searching, filtering, and sorting
pollSchema.index({ title: 'text', description: 'text' });
pollSchema.index({ category: 1, status: 1 });
pollSchema.index({ 'location.city': 1, 'location.state': 1 });
pollSchema.index({ createdBy: 1 });
pollSchema.index({ relatedPetition: 1 });
pollSchema.index({ createdAt: -1 });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;