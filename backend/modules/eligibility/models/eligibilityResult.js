const mongoose = require('mongoose');

const eligibilityResultSchema = new mongoose.Schema({
  applicationId: {
    type: String, // UUID from Supabase
    required: [true, 'Application ID is required'],
    unique: true, // ← This creates an index automatically
  },
  userId: {
    type: String, // UUID from Supabase
    required: [true, 'User ID is required'],
    index: true, // ← Add index here instead of bottom
  },
  programId: {
    type: String, // UUID from Supabase
    required: [true, 'Program ID is required'],
    index: true, // ← Add index here instead of bottom
  },
  status: {
    type: String,
    enum: ['eligible', 'not_eligible', 'pending_review'],
    default: 'pending_review',
    index: true, // ← Add index here instead of bottom
  },
  criteriaChecked: {
    gpaCheck: {
      passed: { type: Boolean, default: false },
      studentGPA: { type: Number, default: 0 },
      requiredGPA: { type: Number, default: 0 },
    },
    coursesCheck: {
      passed: { type: Boolean, default: false },
      totalCourses: { type: Number, default: 0 },
      requiredTotal: { type: Number, default: 8 },
      missingMandatoryCourses: { type: [String], default: [] },
    },
    documentsCheck: {
      passed: { type: Boolean, default: false },
      missingDocuments: { type: [String], default: [] },
    },
  },
  reasons: {
    type: [String],
    default: [],
  },
  evaluatedBy: {
    type: String, // 'system' or staff user UUID
    default: 'system',
  },
  evaluatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// REMOVE THESE DUPLICATE INDEX DECLARATIONS ❌
// eligibilityResultSchema.index({ applicationId: 1 }); // Already indexed via unique: true
// eligibilityResultSchema.index({ userId: 1 }); // Moved to field definition
// eligibilityResultSchema.index({ status: 1 }); // Moved to field definition
// eligibilityResultSchema.index({ programId: 1 }); // Moved to field definition

module.exports = mongoose.model('EligibilityResult', eligibilityResultSchema);