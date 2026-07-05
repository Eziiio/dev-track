import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Please specify an activity action'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for tracking activity']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required for tracking activity']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for history tracking queries
ActivitySchema.index({ project: 1, timestamp: -1 });
ActivitySchema.index({ task: 1, timestamp: -1 });

export default mongoose.model('Activity', ActivitySchema);
