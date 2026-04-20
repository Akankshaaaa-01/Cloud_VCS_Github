import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../authContext';
import { Link,useNavigate } from 'react-router-dom';
import api from '../../axiosConfig';
const Signup=()=>{


  const { setCurrentUser } = useAuth(); 
  const navigate = useNavigate();

    const [email,setEmail]=useState('');
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [loading,setLoading]=useState(false);

    const handleSignup= async (e)=>{
        e.preventDefault();
        try{
            setLoading(true);
            const res= await api.post("/signup",{
                email:email,
                password:password,
                username:username
            });
            const userId = res.data.user._id;
            const token = res.data.token;

           localStorage.setItem("token", token);
           localStorage.setItem("userId", userId);
           
           setCurrentUser(userId);
           setLoading(false);

        //    window.location.href='/';
        
        navigate("/");
           //we can use usenavigate also
            
        } catch(err){
            console.error(err);
            alert("Signup Failed !")
            setLoading(false);
        }
    }
 return(
   <div className='bg-[#0d1117] min-h-screen flex items-center justify-center'>
        <div className="bg-slate-800/60 p-6 rounded-lg w-80 shadow-lg ">
    <h2 className='text-white text-lg text-center mb-6 font-semibold'>
        Sign Up
    </h2>

    <form onSubmit={handleSignup}
    className='flex flex-col gap-3'>
        <input type="text" 
        placeholder='Username'
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
         className='p-2 rounded-lg border border-gray-500 bg-gray-800 text-white  focus:outline-none focus:border-blue-500'></input>
         
         <input type="email" 
         placeholder='Email'
         value={email}
         onChange={(e)=>setEmail(e.target.value)}
          className='p-2 rounded-lg border border-gray-500 bg-gray-800 text-white focus:outline-none focus:border-blue-500'></input>
          
          <input type="password"
           placeholder='Password'
           value={password}
           onChange={(e)=>setPassword(e.target.value)} 
           className='p-2 rounded-lg border border-gray-500 bg-gray-800 text-white focus:outline-none focus:border-blue-500'></input>
          <button type="submit" 
          disabled={loading}
          className='bg-green-600 text-white py-2 rounded-lg hover:bg-green-700'>
            {loading?"Loading...":"Signup"}
          </button>
    </form >
    <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?&nbsp;
          <Link to="/auth" className="text-blue-600 cursor-pointer hover:underline">
            Sign in
          </Link>
        </p>

        </div>
   </div>
 )
}

export default Signup;