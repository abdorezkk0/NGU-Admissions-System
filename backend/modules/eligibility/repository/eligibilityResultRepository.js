const EligibilityResult = require('../models/EligibilityResult');

async function create(data) {
  return EligibilityResult.create(data);
}

async function findByApplicationId(applicationId) {
  return EligibilityResult.findOne({ applicationId });
}

async function findByUserId(userId) {
  return EligibilityResult.find({ userId }).sort({ createdAt: -1 });
}

async function findAll(query, skip, limit) {
  return EligibilityResult.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function count(query) {
  return EligibilityResult.countDocuments(query);
}

async function update(applicationId, data) {
  return EligibilityResult.findOneAndUpdate(
    { applicationId },
    { $set: data },
    { new: true, runValidators: true, upsert: true }
  );
}

async function deleteByApplicationId(applicationId) {
  return EligibilityResult.findOneAndDelete({ applicationId });
}

module.exports = {
  create,
  findByApplicationId,
  findByUserId,
  findAll,
  count,
  update,
  deleteByApplicationId,
};