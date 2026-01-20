const { supabase } = require('../../../shared/config/supabase');
const AppError = require('../../../shared/utils/appError');

class ApplicationService {
  /**
   * Create new application (draft)
   */
  async createApplication(userId, applicationData) {
    try {
      const newApplication = {
        user_id: userId,
        status: 'draft',
        first_name: applicationData.firstName,
        last_name: applicationData.lastName,
        email: applicationData.email,
        phone_number: applicationData.phoneNumber,
        date_of_birth: applicationData.dateOfBirth,
        gender: applicationData.gender,
        nationality: applicationData.nationality,
        national_id: applicationData.nationalId,
        program_id: applicationData.programId,
        entry_year: applicationData.entryYear,
        entry_semester: applicationData.entrySemester,
        address_line1: applicationData.addressLine1,
        address_line2: applicationData.addressLine2,
        city: applicationData.city,
        state: applicationData.state,
        postal_code: applicationData.postalCode,
        country: applicationData.country,
        high_school_name: applicationData.highSchoolName,
        high_school_graduation_year: applicationData.highSchoolGraduationYear,
        high_school_gpa: applicationData.highSchoolGpa,
        high_school_country: applicationData.highSchoolCountry,
        eligibility_status: 'pending',
        decision: 'pending',
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
      // Get existing application
      const existing = await this.getApplicationById(applicationId, userId, userRole);

      // Only allow updates to draft applications (unless staff/admin)
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
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
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
        throw new AppError('Failed to update application', 500);
      }

      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application update failed', 500);
    }
  }

  /**
   * Submit application for review
   */
  async submitApplication(applicationId, userId, userRole) {
    try {
      const application = await this.getApplicationById(applicationId, userId, userRole);

      if (application.status !== 'draft') {
        throw new AppError('Application already submitted', 400);
      }

      // Validate required fields
      this.validateApplicationForSubmission(application);

      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        throw new AppError('Failed to submit application', 500);
      }

      console.log('✅ Application submitted:', data.id);
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
        throw new AppError('Failed to delete application', 500);
      }

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select('*, programs(*)')
        .single();

      if (error) {
        throw new AppError('Failed to withdraw application', 500);
      }

      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Application withdrawal failed', 500);
    }
  }

  /**
   * Get all applications (staff/admin only) with pagination
   */
  async getAllApplications(filters = {}, page = 1, limit = 20) {
    try {
      let query = supabase
        .from('applications')
        .select('*, programs(*)', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.decision) {
        query = query.eq('decision', filters.decision);
      }
      if (filters.programId) {
        query = query.eq('program_id', filters.programId);
      }
      if (filters.entryYear) {
        query = query.eq('entry_year', filters.entryYear);
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
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

  /**
   * Update application status (staff/admin only)
   */
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
        throw new AppError('Failed to update status', 500);
      }

      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Status update failed', 500);
    }
  }

  /**
   * Make admission decision (staff/admin only)
   */
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
        throw new AppError('Failed to make decision', 500);
      }

      console.log(`✅ Decision made: ${decision} for application ${applicationId}`);
      return this.formatApplication(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Decision failed', 500);
    }
  }

  /**
   * Validate application has required fields for submission
   */
  validateApplicationForSubmission(application) {
    const required = [
      'firstName', 'lastName', 'email', 'dateOfBirth',
      'gender', 'nationality', 'nationalId', 'programId',
      'entryYear', 'entrySemester'
    ];

    const missing = required.filter(field => !application[field]);

    if (missing.length > 0) {
      throw new AppError(
        `Missing required fields: ${missing.join(', ')}`,
        400
      );
    }
  }

  /**
   * Format application for response
   */
  formatApplication(app) {
    return {
      id: app.id,
      userId: app.user_id,
      status: app.status,
      
      // Personal Info
      firstName: app.first_name,
      lastName: app.last_name,
      email: app.email,
      phoneNumber: app.phone_number,
      dateOfBirth: app.date_of_birth,
      gender: app.gender,
      nationality: app.nationality,
      nationalId: app.national_id,
      
      // Address
      addressLine1: app.address_line1,
      addressLine2: app.address_line2,
      city: app.city,
      state: app.state,
      postalCode: app.postal_code,
      country: app.country,
      
      // Academic
      programId: app.program_id,
      program: app.programs ? {
        id: app.programs.id,
        name: app.programs.name,
        code: app.programs.code,
        department: app.programs.department,
      } : null,
      entryYear: app.entry_year,
      entrySemester: app.entry_semester,
      
      // Education
      highSchoolName: app.high_school_name,
      highSchoolGraduationYear: app.high_school_graduation_year,
      highSchoolGpa: app.high_school_gpa,
      highSchoolCountry: app.high_school_country,
      
      // Eligibility
      eligibilityScore: app.eligibility_score,
      eligibilityStatus: app.eligibility_status,
      
      // Decision
      decision: app.decision,
      decisionDate: app.decision_date,
      decisionBy: app.decision_by,
      decisionNotes: app.decision_notes,
      
      // Metadata
      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewed_by,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
    };
  }
}

module.exports = new ApplicationService();