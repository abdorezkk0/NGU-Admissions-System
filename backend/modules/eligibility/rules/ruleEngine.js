// Hardcoded university-wide requirements
const MANDATORY_COURSES = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'English'];
const REQUIRED_TOTAL_COURSES = 8;
const REQUIRED_DOCUMENTS = ['transcript', 'national_id', 'photo'];

/**
 * Check if student's GPA meets program requirement
 */
function checkGPA(studentGPA, requiredGPA) {
  const gpa = parseFloat(studentGPA) || 0;
  const required = parseFloat(requiredGPA) || 0;

  return {
    passed: gpa >= required,
    studentGPA: gpa,
    requiredGPA: required,
  };
}

/**
 * Check if student has required courses
 */
function checkCourses(studentCourses = []) {
  const totalCourses = studentCourses.length;

  // Check if student has at least 8 courses
  const hasSufficientCourses = totalCourses >= REQUIRED_TOTAL_COURSES;

  // Check which mandatory courses are missing
  const missingMandatoryCourses = MANDATORY_COURSES.filter(mandatory => 
    !studentCourses.some(studentCourse => 
      studentCourse.toLowerCase().includes(mandatory.toLowerCase())
    )
  );

  const hasAllMandatoryCourses = missingMandatoryCourses.length === 0;

  return {
    passed: hasSufficientCourses && hasAllMandatoryCourses,
    totalCourses,
    requiredTotal: REQUIRED_TOTAL_COURSES,
    missingMandatoryCourses,
  };
}

/**
 * Check if all required documents are approved
 */
function checkDocuments(approvedDocTypes = []) {
  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    doc => !approvedDocTypes.includes(doc)
  );

  return {
    passed: missingDocuments.length === 0,
    missingDocuments,
  };
}

/**
 * Main evaluation function
 */
function evaluateApplication(application, approvedDocTypes, programMinGPA) {
  const result = {
    status: 'pending_review',
    reasons: [],
    criteriaChecked: {
      gpaCheck: {},
      coursesCheck: {},
      documentsCheck: {},
    },
  };

  // 1. Check GPA
  result.criteriaChecked.gpaCheck = checkGPA(application.gpa, programMinGPA);
  
  if (!result.criteriaChecked.gpaCheck.passed) {
    result.reasons.push(
      `GPA ${result.criteriaChecked.gpaCheck.studentGPA.toFixed(2)} is below minimum ${result.criteriaChecked.gpaCheck.requiredGPA.toFixed(2)}`
    );
  }

  // 2. Check Courses
  result.criteriaChecked.coursesCheck = checkCourses(application.courses);
  
  if (!result.criteriaChecked.coursesCheck.passed) {
    const { totalCourses, requiredTotal, missingMandatoryCourses } = result.criteriaChecked.coursesCheck;
    
    if (totalCourses < requiredTotal) {
      result.reasons.push(
        `Only ${totalCourses} courses submitted, minimum ${requiredTotal} required`
      );
    }
    
    if (missingMandatoryCourses.length > 0) {
      result.reasons.push(
        `Missing mandatory courses: ${missingMandatoryCourses.join(', ')}`
      );
    }
  }

  // 3. Check Documents
  result.criteriaChecked.documentsCheck = checkDocuments(approvedDocTypes);
  
  if (!result.criteriaChecked.documentsCheck.passed) {
    result.reasons.push(
      `Missing required documents: ${result.criteriaChecked.documentsCheck.missingDocuments.join(', ')}`
    );
  }

  // 4. Determine final status
  const allChecksPassed = 
    result.criteriaChecked.gpaCheck.passed &&
    result.criteriaChecked.coursesCheck.passed &&
    result.criteriaChecked.documentsCheck.passed;

  result.status = allChecksPassed ? 'eligible' : 'not_eligible';

  if (allChecksPassed) {
    result.reasons = ['All eligibility criteria met'];
  }

  return result;
}

/**
 * Get requirements info
 */
function getRequirements() {
  return {
    mandatoryCourses: MANDATORY_COURSES,
    totalCoursesRequired: REQUIRED_TOTAL_COURSES,
    requiredDocuments: REQUIRED_DOCUMENTS,
    note: 'Minimum GPA requirement varies by program',
  };
}

module.exports = {
  evaluateApplication,
  getRequirements,
  checkGPA,
  checkCourses,
  checkDocuments,
};