//Request → Middleware → Controller → Response
// 1. Authentication Middleware

// 👉 “User kaun hai?”

// token verify karo → user identify karo

const jwt= require("jsonwebtoken");
const authMiddleware =(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        // headers kya hote hain?
        //  metadata of request, request ke saath aane wali extra info
        // Example:
        // Authorization: Bearer TOKEN
      if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    //"Bearer Token" bearer is a standard prefix
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    //result is decoded = { id: "userId" }

    req.user=decoded.id;
    // maine manually req object mein data add kr dia hai
    //express allows adding custom properties

    next();
    }catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}