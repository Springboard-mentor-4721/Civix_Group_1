const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: [true, 'Poll is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Selected option is required']
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

// Unique compound index: a user can only vote on a specific poll once
voteSchema.index({ poll: 1, user: 1 }, { unique: true });
voteSchema.index({ poll: 1, createdAt: -1 });
voteSchema.index({ user: 1, createdAt: -1 });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
