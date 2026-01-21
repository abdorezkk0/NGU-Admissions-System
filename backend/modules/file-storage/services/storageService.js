const { supabase } = require('../../../shared/config/supabase');
const AppError = require('../../../shared/utils/appError');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  /**
   * Upload file to Supabase Storage and save metadata to database
   */
  async uploadFile(userId, file) {
    try {
      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const storagePath = `${userId}/documents/${fileName}`;
      const bucket = 'admissions-documents';

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (storageError) {
        console.error('❌ Storage upload error:', storageError);
        throw new AppError('Failed to upload file to storage', 500);
      }

      console.log('✅ File uploaded to storage:', storagePath);

      // Save file metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: userId,
          file_name: fileName,
          original_name: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          storage_path: storagePath,
          storage_bucket: bucket,
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        
        // Rollback: Delete from storage if database insert fails
        await supabase.storage.from(bucket).remove([storagePath]);
        
        throw new AppError('Failed to save file metadata', 500);
      }

      console.log('✅ File metadata saved to database:', fileRecord.id);

      return this.formatFile(fileRecord);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ File upload error:', error);
      throw new AppError('File upload failed', 500);
    }
  }

  /**
   * Get user's files
   */
  async getUserFiles(userId) {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new AppError('Failed to fetch files', 500);
      }

      return data.map(file => this.formatFile(file));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch files', 500);
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId, userId, userRole) {
    try {
      let query = supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      // Students can only view their own files
      if (userRole === 'applicant') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error || !data) {
        throw new AppError('File not found', 404);
      }

      return this.formatFile(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch file', 500);
    }
  }

  /**
   * Get signed download URL
   */
  async getSignedUrl(fileId, userId, userRole, expiresIn = 300) {
    try {
      // Get file record
      const file = await this.getFileById(fileId, userId, userRole);

      // Generate signed URL
      const { data, error } = await supabase.storage
        .from(file.storageBucket)
        .createSignedUrl(file.storagePath, expiresIn);

      if (error) {
        console.error('❌ Signed URL error:', error);
        throw new AppError('Failed to generate download URL', 500);
      }

      return {
        file: {
          id: file.id,
          fileName: file.fileName,
          originalName: file.originalName,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
        },
        url: data.signedUrl,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate download URL', 500);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId, userId, userRole) {
    try {
      // Get file record
      const file = await this.getFileById(fileId, userId, userRole);

      // Check if file is used in any document
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id')
        .eq('file_id', fileId)
        .limit(1);

      if (docError) {
        throw new AppError('Failed to check file usage', 500);
      }

      if (documents && documents.length > 0) {
        throw new AppError('Cannot delete file that is linked to a document', 400);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(file.storageBucket)
        .remove([file.storagePath]);

      if (storageError) {
        console.error('❌ Storage delete error:', storageError);
        throw new AppError('Failed to delete file from storage', 500);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        console.error('❌ Database delete error:', dbError);
        throw new AppError('Failed to delete file record', 500);
      }

      console.log('✅ File deleted:', fileId);
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('File deletion failed', 500);
    }
  }

  /**
   * Get all files (staff/admin only)
   */
  async getAllFiles(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('files')
        .select('*', { count: 'exact' })
        .order('uploaded_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AppError('Failed to fetch files', 500);
      }

      return {
        files: data.map(file => this.formatFile(file)),
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch files', 500);
    }
  }

  /**
   * Format file for response
   */
  formatFile(file) {
    return {
      id: file.id,
      userId: file.user_id,
      fileName: file.file_name,
      originalName: file.original_name,
      mimeType: file.mime_type,
      fileSize: file.file_size,
      storagePath: file.storage_path,
      storageBucket: file.storage_bucket,
      uploadedAt: file.uploaded_at,
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    };
  }
}

module.exports = new StorageService();