import { useState,useEffect } from 'react';
import api from '../../axiosConfig';
import { useAuth } from '../../authContext';
import { Link,useNavigate } from 'react-router-dom';


const Login=()=>{

    useEffect(()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
    },[])

  const { currentUser, setCurrentUser } = useAuth(); 
  const navigate = useNavigate();

    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [loading,setLoading]=useState(false);

    const handleLogin= async (e)=>{
        e.preventDefault();
        try{
            setLoading(true);
            const res= await api.post("/login",{
                email:email,
                password:password,
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
            alert("Login Failed !")
            setLoading(false);
        }
    }
 return(
   <div className='bg-[#0d1117] min-h-screen flex items-center justify-center'>
        <div className="bg-slate-800/60 p-6 rounded-lg w-80 shadow-lg ">
    <h2 className='text-white text-lg text-center mb-6 font-semibold'>
        Sign In
    </h2>

    <form onSubmit={handleLogin}
    className='flex flex-col gap-3'>
       
         
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
            {loading?"Loading...":"Login"}
          </button>
    </form >
    <p className="text-gray-400 text-sm text-center mt-4">
          New to Github?&nbsp;
          <Link to="/signup" className="text-blue-600 cursor-pointer hover:underline">
            Create an account
          </Link>
        </p>

        </div>
   </div>
 )
}

export default Login;