const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  applicationId: {
    type: String, // ← Changed from ObjectId to String (for Supabase UUID)
    required: [true, 'Application ID is required'],
  },
  type: {
    type: String,
    required: [true, 'Document type is required'],
    enum: ['transcript', 'id_card', 'national_id', 'photo', 'certificates', 'recommendation', 'other'],
  },
  fileId: {
    type: String, // UUID from Supabase
    required: [true, 'File ID is required'],
  },
  fileName: {
    type: String,
  },
  uploadedBy: {
    type: String, // UUID from Supabase
    required: [true, 'Uploader ID is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'pending_review', 'approved', 'rejected'],
    default: 'pending_review',
  },
  verifiedBy: {
    type: String, // UUID from Supabase
  },
  verifiedAt: {
    type: Date,
  },
  verifyNote: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
documentSchema.index({ applicationId: 1, type: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);