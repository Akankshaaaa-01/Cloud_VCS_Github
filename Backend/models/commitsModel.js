const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommitSchema = new Schema({

  message: {
    type: String,
    required: true,
  },

  repository: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  filesChanged: [
    {
      type: String,
    }
  ]

}, { timestamps: true });

const Commit = mongoose.model("Commit", CommitSchema);
module.exports = Commit;