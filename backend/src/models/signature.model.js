const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema(
  {
    petition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Petition',
      required: [true, 'Petition is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
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

// Unique compound index: a user can only sign a specific petition once
signatureSchema.index({ petition: 1, user: 1 }, { unique: true });
signatureSchema.index({ petition: 1, createdAt: -1 });
signatureSchema.index({ user: 1, createdAt: -1 });

const Signature = mongoose.model('Signature', signatureSchema);

module.exports = Signature;
