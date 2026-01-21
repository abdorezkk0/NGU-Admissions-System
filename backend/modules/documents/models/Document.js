const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'national_id',
        'passport',
        'transcript',
        'certificate',
        'photo',
        'other',
      ],
    },

    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },

    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: 'pending_review',
    },

    uploadedBy: { type: String, required: true },
    verifiedBy: { type: String, default: null },
    verifyNote: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
