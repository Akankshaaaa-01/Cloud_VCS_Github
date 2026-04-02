import { useNavigate,useRoutes } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Profile from "./components/user/Profile";

import { useAuth } from "./authContext";

const ProjectRoutes=()=>{
    const{currentUser,setCurrentUser}=useAuth();
    const navigate= useNavigate();
    

    useEffect(()=>{
        const userIdFromStorage= localStorage.getItem("userId");
        if(userIdFromStorage && !currentUser){
            setCurrentUser(userIdFromStorage);
        }

         //  Agar userId nahi mila aur public page nahi hai
        if(!userIdFromStorage && !["/auth","/signup"].includes(window.location.pathname)){
            navigate("/auth"); // Login pe bhej
        }
        
        //  Agar userId mila aur login page pe hai
         if(userIdFromStorage && window.location.pathname=='/auth'){
            navigate("/"); // Home pe bhejo
         }
    },[currentUser, navigate, setCurrentUser])

    let element= useRoutes([
        {
            path:"/",
            element:<Dashboard/>
        },
        {
            path:"/auth",
            element:<Login/>
        },
        {
            path:"/signup",
            element:<Signup/>
        },
        {
            path:"/profile",
            element:<Profile/>
        }
    ]);

    return element;
}


export default ProjectRoutes;

//const ProjectRoutes=()=>{
    // const{currentUser,setCurrentUser}=useAuth();
    // const navigate= useNavigate();
    // const location = useLocation(); 

    // useEffect(()=>{
    //     const userIdFromStorage= localStorage.getItem("userId");
    //     if(userIdFromStorage && !currentUser){
    //         setCurrentUser(userIdFromStorage);
    //     }
        
    //      const publicPaths = ["/auth", "/signup"];
    //     if (!userIdFromStorage && !publicPaths.includes(location.pathname)) { // ✅ use location.pathname
    //         navigate("/auth");
    //     }

    //     if (userIdFromStorage && location.pathname === "/auth") { // ✅ use location.pathname
    //         navigate("/");
    //     }