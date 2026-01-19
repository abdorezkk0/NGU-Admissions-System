use('ngu_admissions');

console.log("🌱 Seeding test data...");

// Insert sample applications
const sampleApplications = [
  {
    userId: "test_user_001",
    personalInfo: {
      fullName: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      phoneNumber: "+20 100 123 4567",
      dateOfBirth: new Date("2005-05-15"),
      nationality: "Egyptian"
    },
    academicInfo: {
      previousSchool: "Cairo International School",
      graduationYear: 2023,
      gpa: 3.8,
      testScores: {
        sat: 1450,
        toefl: 105
      }
    },
    programInfo: {
      programType: "undergraduate",
      intendedMajor: "Computer Science",
      semester: "Fall 2026",
      startDate: new Date("2026-09-01")
    },
    status: "submitted",
    documentStatus: "complete",
    eligibilityStatus: "eligible",
    submittedAt: new Date("2025-01-15T10:30:00Z"),
    createdAt: new Date("2025-01-10T08:00:00Z"),
    updatedAt: new Date("2025-01-15T10:30:00Z"),
    statusHistory: [
      {
        status: "draft",
        changedBy: "test_user_001",
        changedAt: new Date("2025-01-10T08:00:00Z"),
        notes: "Application created"
      },
      {
        status: "submitted",
        changedBy: "test_user_001",
        changedAt: new Date("2025-01-15T10:30:00Z"),
        notes: "Application submitted for review"
      }
    ]
  },
  {
    userId: "test_user_002",
    personalInfo: {
      fullName: "Sara Mohamed",
      email: "sara.mohamed@example.com",
      phoneNumber: "+20 101 234 5678",
      dateOfBirth: new Date("2004-08-22"),
      nationality: "Egyptian"
    },
    academicInfo: {
      previousSchool: "Alexandria STEM School",
      graduationYear: 2022,
      gpa: 3.9,
      testScores: {
        sat: 1520,
        toefl: 110
      }
    },
    programInfo: {
      programType: "undergraduate",
      intendedMajor: "Business Administration",
      semester: "Spring 2026"
    },
    status: "draft",
    documentStatus: "incomplete",
    eligibilityStatus: "pending",
    createdAt: new Date("2025-01-18T14:20:00Z"),
    updatedAt: new Date("2025-01-18T14:20:00Z"),
    statusHistory: []
  },
  {
    userId: "test_user_003",
    personalInfo: {
      fullName: "Omar Khaled",
      email: "omar.khaled@example.com",
      phoneNumber: "+20 102 345 6789",
      dateOfBirth: new Date("2001-12-10"),
      nationality: "Egyptian"
    },
    academicInfo: {
      previousSchool: "Cairo University",
      graduationYear: 2023,
      gpa: 3.6,
      testScores: {
        gre: 320,
        toefl: 95
      }
    },
    programInfo: {
      programType: "graduate",
      intendedMajor: "Data Science",
      semester: "Fall 2026"
    },
    status: "under_review",
    documentStatus: "complete",
    eligibilityStatus: "eligible",
    submittedAt: new Date("2025-01-12T09:00:00Z"),
    reviewedAt: new Date("2025-01-17T11:30:00Z"),
    createdAt: new Date("2025-01-08T15:00:00Z"),
    updatedAt: new Date("2025-01-17T11:30:00Z"),
    statusHistory: [
      {
        status: "draft",
        changedBy: "test_user_003",
        changedAt: new Date("2025-01-08T15:00:00Z")
      },
      {
        status: "submitted",
        changedBy: "test_user_003",
        changedAt: new Date("2025-01-12T09:00:00Z")
      },
      {
        status: "under_review",
        changedBy: "staff_001",
        changedAt: new Date("2025-01-17T11:30:00Z"),
        notes: "All documents verified, proceeding with review"
      }
    ]
  }
];

db.applications.insertMany(sampleApplications);
console.log(`   ✅ Inserted ${sampleApplications.length} sample applications`);

// Insert sample eligibility rules
const sampleRules = [
  {
    ruleName: "Undergraduate Minimum Requirements",
    description: "Basic eligibility criteria for undergraduate programs",
    programType: "undergraduate",
    conditions: {
      minGPA: 3.0,
      minSAT: 1200,
      minTOEFL: 80,
      requiredDocuments: ["transcript", "diploma", "id", "photo"]
    },
    isActive: true,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin_001",
    version: 1
  },
  {
    ruleName: "Graduate Minimum Requirements",
    description: "Basic eligibility criteria for graduate programs",
    programType: "graduate",
    conditions: {
      minGPA: 3.5,
      minGRE: 310,
      minTOEFL: 90,
      requiredDocuments: ["transcript", "degree", "recommendation", "statement", "cv"]
    },
    isActive: true,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin_001",
    version: 1
  },
  {
    ruleName: "Computer Science Program Requirements",
    description: "Additional requirements for CS major",
    programType: "undergraduate",
    conditions: {
      minGPA: 3.3,
      minSAT: 1350,
      requiredDocuments: ["transcript", "diploma", "id", "photo"]
    },
    isActive: true,
    priority: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin_001",
    version: 1
  }
];

db.eligibility_rules.insertMany(sampleRules);
console.log(`   ✅ Inserted ${sampleRules.length} eligibility rules`);

// Show summary
console.log("\n📊 Database Summary:");
console.log(`   Applications: ${db.applications.countDocuments()}`);
console.log(`   Documents: ${db.documents.countDocuments()}`);
console.log(`   Notifications: ${db.notifications.countDocuments()}`);
console.log(`   Eligibility Rules: ${db.eligibility_rules.countDocuments()}`);

console.log("\n✅ Test data seeded successfully!");

// Show sample data
console.log("\n📋 Sample Applications:");
db.applications.find().limit(3).forEach(app => {
  console.log(`   - ${app.personalInfo.fullName}: ${app.status} (${app.programInfo.intendedMajor})`);
});