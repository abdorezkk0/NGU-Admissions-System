const { supabase } = require('../../../shared/config/supabase');
const AppError = require('../../../shared/utils/appError');

class ProgramService {
  /**
   * Get all active programs
   */
  async getAllPrograms() {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .eq('accepting_applications', true)
        .order('name');

      if (error) {
        console.error('❌ Programs fetch error:', error);
        throw new AppError('Failed to fetch programs', 500);
      }

      return data.map(program => this.formatProgram(program));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch programs', 500);
    }
  }

  /**
   * Get program by ID
   */
  async getProgramById(programId) {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (error || !data) {
        throw new AppError('Program not found', 404);
      }

      return this.formatProgram(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch program', 500);
    }
  }

  /**
   * Get program by code
   */
  async getProgramByCode(code) {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        throw new AppError('Program not found', 404);
      }

      return this.formatProgram(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch program', 500);
    }
  }

  /**
   * Check if program accepts applications
   */
  async isProgramAcceptingApplications(programId) {
    try {
      const program = await this.getProgramById(programId);
      return program.isActive && program.acceptingApplications;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format program for response
   */
  formatProgram(program) {
    return {
      id: program.id,
      name: program.name,
      code: program.code,
      description: program.description,
      degreeType: program.degree_type,
      department: program.department,
      durationYears: program.duration_years,
      minGpa: program.min_gpa,
      maxCapacity: program.max_capacity,
      isActive: program.is_active,
      acceptingApplications: program.accepting_applications,
      createdAt: program.created_at,
      updatedAt: program.updated_at,
    };
  }
}

module.exports = new ProgramService();