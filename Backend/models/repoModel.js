const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema({

  name: {
    type: String,
    required: true,
    unique: true,
  },

  description: {
    type: String,
    default: "",
  },

  content: [
    {
      type: String,
    }
  ],

  visibility: {
    type: Boolean,
    default: true,
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    }
  ],

  //  NEW (important for future)
  stars: {
    type: Number,
    default: 0,
  }

}, { timestamps: true });

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;