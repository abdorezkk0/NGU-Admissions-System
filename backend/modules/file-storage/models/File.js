const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // could be ObjectId if you have users collection
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },

    bucket: { type: String, required: true },
    storagePath: { type: String, required: true }, // e.g. documents/abc123.pdf
    provider: { type: String, required: true },    // "supabase" or "local"

    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
