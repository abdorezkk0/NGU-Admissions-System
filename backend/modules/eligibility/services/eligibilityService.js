const eligibilityResultRepo = require('../repository/eligibilityResultRepository');
const { supabase } = require('../../../shared/config/supabase');
const Document = require('../../documents/models/Document');
const ruleEngine = require('../rules/ruleEngine');

/**
 * Evaluate eligibility for an application
 */
async function evaluateEligibility(applicationId, evaluatedBy = 'system') {
  try {
    console.log('🔍 Evaluating eligibility for application:', applicationId);

    // 1. Fetch application from Supabase (simplified query first)
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) {
      console.error('❌ Supabase error:', appError);
      throw new Error(`Supabase error: ${appError.message}`);
    }

    if (!application) {
      console.error('❌ No application data returned');
      throw new Error('Application not found - no data returned from database');
    }

    console.log('✅ Application found:', application.id);

    // 2. Fetch program separately
    const { data: program, error: progError } = await supabase
      .from('programs')
      .select('id, name, min_gpa')
      .eq('id', application.program_id)
      .single();

    if (progError) {
      console.error('❌ Program fetch error:', progError);
      console.warn('⚠️ Continuing without program data, using default min GPA');
    }

    console.log('📄 Application data:', {
      id: application.id,
      gpa: application.high_school_gpa,
      courses: application.courses,
      programName: program?.name,
      minGPA: program?.min_gpa || 3.0,
    });

    // 3. Fetch approved documents for this application
    const documents = await Document.find({ 
      applicationId, 
      status: 'approved' 
    });

    const approvedDocTypes = documents.map(doc => doc.type);
    console.log('📎 Approved documents:', approvedDocTypes);

    // 4. Use rule engine to evaluate
    const evaluationResult = ruleEngine.evaluateApplication(
      {
        ...application,
        gpa: application.high_school_gpa, // Use correct field name
      },
      approvedDocTypes,
      program?.min_gpa || 3.0 // Default min GPA if program not found
    );

    // 5. Prepare result object
    const result = {
      applicationId,
      userId: application.user_id,
      programId: application.program_id,
      status: evaluationResult.status,
      reasons: evaluationResult.reasons,
      criteriaChecked: evaluationResult.criteriaChecked,
      evaluatedBy,
      evaluatedAt: new Date(),
    };

    console.log('📊 Final eligibility status:', result.status);
    console.log('📊 Reasons:', result.reasons);

    // 6. Save result to database
    const savedResult = await eligibilityResultRepo.update(applicationId, result);

    // 7. Update application status in Supabase based on eligibility
    const newApplicationStatus = result.status === 'eligible' ? 'accepted' : 'rejected';
    
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: newApplicationStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('❌ Failed to update application status:', updateError);
      console.warn('⚠️ Eligibility result saved but application status not updated');
    } else {
      console.log(`✅ Application status updated to: ${newApplicationStatus}`);
    }

    return savedResult;
  } catch (error) {
    console.error('❌ Eligibility evaluation error:', error);
    throw error;
  }
}

/**
 * Get eligibility result for an application
 */
async function getEligibilityResult(applicationId) {
  return eligibilityResultRepo.findByApplicationId(applicationId);
}

/**
 * Get eligibility results for a user (student)
 */
async function getUserEligibilityResults(userId) {
  return eligibilityResultRepo.findByUserId(userId);
}

/**
 * Get all eligibility results with pagination (staff/admin)
 */
async function getAllEligibilityResults(query, options) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const results = await eligibilityResultRepo.findAll(query, skip, limit);
  const total = await eligibilityResultRepo.count(query);

  return {
    results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get eligibility requirements info
 */
function getEligibilityRequirements() {
  return ruleEngine.getRequirements();
}

module.exports = {
  evaluateEligibility,
  getEligibilityResult,
  getUserEligibilityResults,
  getAllEligibilityResults,
  getEligibilityRequirements,
};