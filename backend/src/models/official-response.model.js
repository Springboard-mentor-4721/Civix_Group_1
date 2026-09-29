const mongoose = require('mongoose');

const validStatuses = ['draft', 'active', 'under_review', 'closed', 'flagged'];

const officialResponseSchema = new mongoose.Schema(
  {
    petition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Petition',
      required: [true, 'Petition reference is required']
    },
    official: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Official reference is required']
    },
    comment: {
      type: String,
      required: [true, 'Response comment is required'],
      trim: true,
      minlength: [5, 'Response comment must be at least 5 characters long'],
      maxlength: [2000, 'Response comment cannot exceed 2000 characters']
    },
    previousStatus: {
      type: String,
      required: [true, 'Previous status is required'],
      enum: {
        values: validStatuses,
        message: 'Invalid previous petition status'
      }
    },
    newStatus: {
      type: String,
      required: [true, 'New status is required'],
      enum: {
        values: validStatuses,
        message: 'Invalid new petition status'
      }
    },
    department: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters']
    },
    officialTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Official title cannot exceed 100 characters']
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

// Indexes for fast retrieval by petition or official
officialResponseSchema.index({ petition: 1, createdAt: -1 });
officialResponseSchema.index({ official: 1, createdAt: -1 });
officialResponseSchema.index({ createdAt: -1 });

const OfficialResponse = mongoose.model('OfficialResponse', officialResponseSchema);

module.exports = OfficialResponse;
