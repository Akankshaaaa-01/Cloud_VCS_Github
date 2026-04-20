const mongoose =require("mongoose");
const {Schema}=mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
  },

  // Google se login ke liye — Google ka unique ID
  googleId: {
    type: String,
    default: null   // normal users ke liye null rahega
  },


  avatar: {
    type: String,
    default: null
  },

  // array of repositories (reference)
  repositories: [
    {
      default:[],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    }
  ],

  followedUsers: [
    {
      default:[],
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  starRepos: [
    {
      default:[],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    }
  ]

}, { timestamps: true });

const User=mongoose.model("User", UserSchema);

module.exports =  User;