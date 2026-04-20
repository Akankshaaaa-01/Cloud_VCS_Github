const jwt = require("jsonwebtoken"); //browser ke local storage ke andar save
const bcrypt = require("bcrypt");
const dotenv= require("dotenv");
const User = require("../models/userModel");

dotenv.config();


async function signUp (req,res){
   try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists !" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      repositories: [],
      followedUsers: [],
      starRepos: []
    });

    // JWT generate
    const token = jwt.sign( { id: user._id }, // payload ->mtlb encode krke(not encrypt) isiko token bana rhe hain
       process.env.JWT_SECRET, //payload = { id: "userId" }
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login= async (req,res)=>{
    const {email,password}=req.body;
    
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials!"})
        }

        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
             return res.status(400).json({message:"Invalid credentials!"})
        }

        const token= jwt.sign(
            {id: user._id}, process.env.JWT_SECRET,{expiresIn:"1d"})

         res.status(200).json({
            message: "Login successful",token,
            user
        });

    } catch(err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
}

const getAllUsers=async (req,res)=>{
    try {
    // saare users fetch karo (password hide karke)
    const users = await User.find({}).select("-password");

    res.status(200).json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message});
  }
}

const getUserProfile=async (req,res)=>{
    try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found"});
    }

    res.status(200).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message});
  }
}

const updateUserProfile = async (req, res) => {
  try {
    // req.user — authenticateMiddleware ne set kiya JWT token se
    // req.params.id — URL mein jo id hai
    
    // Check: jo logged in hai, woh sirf APNA profile update kare
    if (req.user !== req.params.id) {
      return res.status(403).json({ 
        message: "Access denied. You can only update your own profile." 
      });
    }

    const { email, password } = req.body;
    const updateData = {};

    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password"); // password wapas mat bhejo

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUserProfile=async (req,res)=>{
    try {
    // const userId = req.params.id;

    if (req.user !== req.params.id) {
      return res.status(403).json({ 
        message: "Access denied. You can only delete your own account." 
      });
    }
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found"});
    }

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports={
    getAllUsers,signUp,login,getUserProfile,
    updateUserProfile,
    deleteUserProfile
}