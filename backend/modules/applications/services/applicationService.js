const { supabase } = require('../../../shared/config/supabase');
const AppError = require('../../../shared/utils/appError');
const crypto = require('crypto');

class ApplicationService {
  /**
   * Create new application (draft)
   */
  async createApplication(userId, applicationData) {
    try {
      const newApplication = {
        user_id: userId,
        status: 'draft',

        // Personal Info
        first_name: applicationData.firstName,
        last_name: applicationData.lastName,
        email: applicationData.email,
        phone_number: applicationData.phoneNumber,
        date_of_birth: applicationData.dateOfBirth,
        gender: applicationData.gender,
        nationality: applicationData.nationality,
        national_id: applicationData.nationalId,

        // Academic
        program_id: applicationData.programId,
        entry_year: applicationData.entryYear,
        entry_semester: applicationData.entrySemester,

        // Address
        address_line1: applicationData.addressLine1,
        address_line2: applicationData.addressLine2,
        city: applicationData.city,
        state: applicationData.state,
        postal_code: applicationData.postalCode,
        country: applicationData.country,

        // Education
        high_school_name: applicationData.highSchoolName,
        high_school_graduation_year: applicationData.highSchoolGraduationYear,
        high_school_gpa: applicationData.highSchoolGpa,
        high_school_country: applicationData.highSchoolCountry,

        courses: applicationData.courses || [],

        // Eligibility / Decision
        eligibility_status: 'pending',
        decision: 'pending',

        // ✅ Payment fields (Supabase columns)
        fee_paid: false,
        fee_amount: 0,
        payment_ref: null,
        paid_at: null,
      };

      const { data, error } = await supabase
        .from('applications')
        .insert([newApplication])
        .select()
        .single();

      if (error) {
        console.error('❌ Application creation error:', error);
        throw new AppError('Failed to create application', 500);
      }

      console.log('✅ Application created:', data.id);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application creation failed', 500);
    }
  }

  /**
   * ✅ Pay application fee (marks fee_paid=true)
   * Fake payment for now (later replace with Stripe/Paymob transaction id)
   */
  async payApplication(applicationId, userId, amount = 50) {
    try {
      // Verify ownership + check not already paid
      const { data: existing, error: findErr } = await supabase
        .from('applications')
        .select('id, user_id, fee_paid')
        .eq('id', applicationId)
        .single();

      if (findErr || !existing) {
        throw new AppError('Application not found', 404);
      }

      if (existing.user_id !== userId) {
        throw new AppError('Not authorized to pay for this application', 403);
      }

      if (existing.fee_paid) {
        throw new AppError('Application fee already paid', 400);
      }

      const paymentRef = `PAY-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      const { data, error } = await supabase
        .from('applications')
        .update({
          fee_paid: true,
          fee_amount: Number(amount || 50),
          payment_ref: paymentRef,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('user_id', userId)
        .select('*, programs(*)')
        .single();

      if (error) {
        console.error('❌ Payment update error:', error);
        throw new AppError('Failed to record payment', 500);
      }

      console.log('✅ Payment recorded for application:', data.id);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Payment failed', 500);
    }
  }

  /**
   * Get user's applications
   */
  async getUserApplications(userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, programs(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch applications', 500);
      }

      return data.map(app => this.formatApplication(app));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch applications', 500);
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId, userId, userRole) {
    try {
      let query = supabase
        .from('applications')
        .select('*, programs(*)')
        .eq('id', applicationId)
        .single();

      // Students can only view their own applications
      if (userRole === 'applicant') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error || !data) {
        throw new AppError('Application not found', 404);
      }

      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch application', 500);
    }
  }

  /**
   * Update application (draft only)
   */
  async updateApplication(applicationId, userId, updates, userRole) {
    try {
      const existing = await this.getApplicationById(applicationId, userId, userRole);

      if (existing.status !== 'draft' && userRole === 'applicant') {
        throw new AppError('Cannot update submitted application', 400);
      }

      const updateData = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone_number: updates.phoneNumber,
        date_of_birth: updates.dateOfBirth,
        gender: updates.gender,
        nationality: updates.nationality,
        national_id: updates.nationalId,
        address_line1: updates.addressLine1,
        address_line2: updates.addressLine2,
        city: updates.city,
        state: updates.state,
        postal_code: updates.postalCode,
        country: updates.country,
        program_id: updates.programId,
        entry_year: updates.entryYear,
        entry_semester: updates.entrySemester,
        high_school_name: updates.highSchoolName,
        high_school_graduation_year: updates.highSchoolGraduationYear,
        high_school_gpa: updates.highSchoolGpa,
        high_school_country: updates.highSchoolCountry,
        courses: updates.courses,
        updated_at: new Date().toISOString(),
      };

      Object.keys(updateData).forEach(key =>
        updateData[key] === undefined && delete updateData[key]
      );

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw new AppError('Failed to update application', 500);
      }

      console.log('✅ Application updated:', data.id);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application update failed', 500);
    }
  }

  /**
   * ✅ NEW: Run eligibility check based on courses and GPA with DEBUG LOGGING
   */
  async runEligibilityCheck(applicationId) {
    try {
      const { data: app, error } = await supabase
        .from('applications')
        .select('*, programs(*)')
        .eq('id', applicationId)
        .single();

      if (error || !app) {
        throw new AppError('Application not found', 404);
      }

      // ✅ ADD LOGGING
      console.log('📊 Running eligibility check for:', applicationId);
      console.log('📝 Application data:', {
        gpa: app.high_school_gpa,
        courses: app.courses,
        coursesCount: app.courses?.length || 0
      });

      // Get program requirements
      const { data: requirements } = await supabase
        .from('program_requirements')
        .select('*')
        .eq('program_id', app.program_id)
        .maybeSingle();

      // ✅ ADD LOGGING
      console.log('📋 Program requirements:', {
        minGPA: requirements?.min_gpa,
        requiredCourses: requirements?.required_courses
      });

      let eligibilityStatus = 'pending';
      let eligibilityScore = 0;
      let reasons = [];

      // Basic checks
      const gpa = parseFloat(app.high_school_gpa) || 0;
      const minGPA = requirements?.min_gpa || 2.5;
      
      // 1. GPA Check (40 points)
      if (gpa >= minGPA) {
        eligibilityScore += 40;
        reasons.push(`GPA ${gpa} meets minimum ${minGPA}`);
        console.log('✅ GPA Check: +40 points');
      } else {
        reasons.push(`GPA ${gpa} below minimum ${minGPA}`);
        console.log('❌ GPA Check: 0 points (GPA too low)');
      }

      // 2. Courses Check (40 points)
      const courses = app.courses || [];
      const requiredCourses = requirements?.required_courses || [];
      
      console.log('📚 Courses check:', {
        studentCourses: courses.length,
        requiredCourses: requiredCourses.length
      });
      
      if (requiredCourses.length > 0) {
        const takenCodes = courses.map(c => c.code?.toUpperCase());
        const requiredCodes = requiredCourses.map(r => r.toUpperCase());
        const matchedCourses = requiredCodes.filter(rc => takenCodes.includes(rc));
        
        const coursePercentage = (matchedCourses.length / requiredCodes.length) * 100;
        const coursePoints = Math.round((coursePercentage / 100) * 40);
        
        eligibilityScore += coursePoints;
        reasons.push(`${matchedCourses.length}/${requiredCodes.length} required courses taken`);
        console.log(`✅ Course Match: +${coursePoints} points (${matchedCourses.length}/${requiredCodes.length})`);
      } else {
        // No specific course requirements - award points based on quantity
        if (courses.length >= 5) {
          eligibilityScore += 40;
          reasons.push(`${courses.length} courses provided`);
          console.log(`✅ Courses: +40 points (${courses.length} courses)`);
        } else if (courses.length > 0) {
          const coursePoints = Math.round((courses.length / 5) * 40);
          eligibilityScore += coursePoints;
          reasons.push(`${courses.length} courses (minimum 5 recommended)`);
          console.log(`⚠️ Courses: +${coursePoints} points (${courses.length}/5 courses)`);
        } else {
          reasons.push('No courses provided');
          console.log('❌ Courses: 0 points (no courses)');
        }
      }

      // 3. Application Completeness (20 points)
      const hasAllFields = app.first_name && app.last_name && app.email && 
                          app.date_of_birth && app.national_id && app.high_school_gpa;
      if (hasAllFields) {
        eligibilityScore += 20;
        reasons.push('Application complete');
        console.log('✅ Completeness: +20 points');
      } else {
        eligibilityScore += 10;
        reasons.push('Application partially complete');
        console.log('⚠️ Completeness: +10 points');
      }

      // Determine status based on score
      if (eligibilityScore >= 80) {
        eligibilityStatus = 'eligible';
      } else if (eligibilityScore >= 60) {
        eligibilityStatus = 'review_required';
      } else {
        eligibilityStatus = 'not_eligible';
      }

      console.log('🎯 Final Score:', eligibilityScore, '/', 100);
      console.log('📊 Status:', eligibilityStatus);
      console.log('📝 Reasons:', reasons.join('; '));

      // Update application with eligibility results
      const { data: updated, error: updateError } = await supabase
        .from('applications')
        .update({
          eligibility_status: eligibilityStatus,
          eligibility_score: eligibilityScore,
          eligibility_notes: reasons.join('; '),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (updateError) {
        console.error('❌ Eligibility update error:', updateError);
        throw new AppError('Failed to update eligibility', 500);
      }

      console.log(`✅ Eligibility check completed: ${eligibilityStatus} (${eligibilityScore}/100)`);
      return this.formatApplication(updated);
    } catch (error) {
      console.error('❌ Eligibility check error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Eligibility check failed', 500);
    }
  }

  /**
   * Submit application for review
   * ✅ UPDATED: Auto-pays on submit + runs eligibility check
   */
  async submitApplication(applicationId, userId, userRole) {
    try {
      const application = await this.getApplicationById(applicationId, userId, userRole);

      if (application.status !== 'draft') {
        throw new AppError('Application already submitted', 400);
      }

      // Validate required fields
      this.validateApplicationForSubmission(application);

      // ✅ Auto-pay on submit
      const paymentRef = `PAY-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          fee_paid: true,
          fee_amount: 50.00,
          payment_ref: paymentRef,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        console.error('❌ Submit error:', error);
        throw new AppError('Failed to submit application', 500);
      }

      console.log('✅ Application submitted and auto-paid:', data.id);

      // ✅ Run eligibility check after submission
      try {
        await this.runEligibilityCheck(applicationId);
        console.log('✅ Eligibility check completed for application:', applicationId);
      } catch (eligError) {
        console.error('⚠️ Eligibility check failed (non-critical):', eligError.message);
        // Don't fail the submission if eligibility check fails
      }

      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application submission failed', 500);
    }
  }

  /**
   * Delete application (draft only)
   */
  async deleteApplication(applicationId, userId, userRole) {
    try {
      const application = await this.getApplicationById(applicationId, userId, userRole);

      if (application.status !== 'draft' && userRole === 'applicant') {
        throw new AppError('Cannot delete submitted application', 400);
      }

      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) {
        console.error('❌ Delete error:', error);
        throw new AppError('Failed to delete application', 500);
      }

      console.log('✅ Application deleted:', applicationId);
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application deletion failed', 500);
    }
  }

  /**
   * Withdraw submitted application
   */
  async withdrawApplication(applicationId, userId, userRole) {
    try {
      const application = await this.getApplicationById(applicationId, userId, userRole);

      if (!['submitted', 'under_review'].includes(application.status)) {
        throw new AppError('Cannot withdraw application in current status', 400);
      }

      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'withdrawn',
          withdrawn_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        console.error('❌ Withdraw error:', error);
        throw new AppError('Failed to withdraw application', 500);
      }

      console.log('✅ Application withdrawn:', data.id);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application withdrawal failed', 500);
    }
  }

  async getAllApplications(filters = {}, page = 1, limit = 20) {
    try {
      let query = supabase
        .from('applications')
        .select('*, programs(*)', { count: 'exact' });

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.decision) query = query.eq('decision', filters.decision);
      if (filters.programId) query = query.eq('program_id', filters.programId);
      if (filters.entryYear) query = query.eq('entry_year', filters.entryYear);

      const offset = (page - 1) * limit;
      query = query
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Fetch all applications error:', error);
        throw new AppError('Failed to fetch applications', 500);
      }

      return {
        applications: data.map(app => this.formatApplication(app)),
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch applications', 500);
    }
  }

  async updateApplicationStatus(applicationId, status, userId) {
    try {
      const validStatuses = [
        'draft', 'submitted', 'under_review',
        'pending_documents', 'accepted', 'rejected', 'withdrawn'
      ];

      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        console.error('❌ Status update error:', error);
        throw new AppError('Failed to update status', 500);
      }

      console.log('✅ Status updated:', status, 'for application', applicationId);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Status update failed', 500);
    }
  }

  async makeDecision(applicationId, decision, notes, userId) {
    try {
      const validDecisions = ['accepted', 'rejected', 'waitlisted'];

      if (!validDecisions.includes(decision)) {
        throw new AppError('Invalid decision', 400);
      }

      const newStatus = decision === 'accepted' ? 'accepted' : 'rejected';

      const { data, error } = await supabase
        .from('applications')
        .update({
          decision,
          decision_date: new Date().toISOString(),
          decision_by: userId,
          decision_notes: notes,
          status: newStatus,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        console.error('❌ Decision error:', error);
        throw new AppError('Failed to make decision', 500);
      }

      console.log(`✅ Decision made: ${decision} for application ${applicationId}`);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Decision failed', 500);
    }
  }

  validateApplicationForSubmission(application) {
    const required = [
      'firstName', 'lastName', 'email', 'dateOfBirth',
      'gender', 'nationality', 'nationalId', 'programId',
      'entryYear', 'entrySemester'
    ];

    const missing = required.filter(field => !application[field]);

    if (missing.length > 0) {
      throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    }
  }

  formatApplication(app) {
    return {
      id: app.id,
      userId: app.user_id,
      status: app.status,

      firstName: app.first_name,
      lastName: app.last_name,
      email: app.email,
      phoneNumber: app.phone_number,
      dateOfBirth: app.date_of_birth,
      gender: app.gender,
      nationality: app.nationality,
      nationalId: app.national_id,

      addressLine1: app.address_line1,
      addressLine2: app.address_line2,
      city: app.city,
      state: app.state,
      postalCode: app.postal_code,
      country: app.country,

      programId: app.program_id,
      program: app.programs ? {
        id: app.programs.id,
        name: app.programs.name,
        code: app.programs.code,
        department: app.programs.department,
      } : null,
      entryYear: app.entry_year,
      entrySemester: app.entry_semester,

      highSchoolName: app.high_school_name,
      highSchoolGraduationYear: app.high_school_graduation_year,
      highSchoolGpa: app.high_school_gpa,
      highSchoolCountry: app.high_school_country,
      courses: app.courses || [],

      // ✅ Payment
      feePaid: app.fee_paid,
      feeAmount: app.fee_amount,
      paymentRef: app.payment_ref,
      paidAt: app.paid_at,

      // ✅ Eligibility (updated to include notes)
      eligibilityScore: app.eligibility_score,
      eligibilityStatus: app.eligibility_status,
      eligibilityNotes: app.eligibility_notes,

      decision: app.decision,
      decisionDate: app.decision_date,
      decisionBy: app.decision_by,
      decisionNotes: app.decision_notes,

      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewed_by,
      withdrawnAt: app.withdrawn_at,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
    };
  }
}

module.exports = new ApplicationService();