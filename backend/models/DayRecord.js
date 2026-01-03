const mongoose = require('mongoose');

const dayRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  },
  isSuccessful: {
    type: Boolean,
    default: false
  },
  taskCount: {
    type: Number,
    default: 0,
    min: 0
  },
  completedTaskCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Unique index for user-date combination
dayRecordSchema.index({ userId: 1, date: 1 }, { unique: true });
dayRecordSchema.index({ userId: 1, isSuccessful: 1 });

module.exports = mongoose.model('DayRecord', dayRecordSchema);
