import {createContext, useState, useEffect, useContext} from 'react';

// Step 1 — dabba banao
const AuthContext =createContext();

// Step 2 — shortcut hook
export const useAuth=()=>{
    return useContext(AuthContext);
}

// Step 3 — Provider banao
export const AuthProvider=({children})=>{
    const [currentUser, setCurrentUser]= useState(null);
    useEffect(()=>{
         // App khulte hi check karo — kya pehle se login tha?
        const userId= localStorage.getItem('userId');
        if(userId){
            setCurrentUser(userId); // haan tha! set karo
        }
    },[]); // [] matlab — sirf ek baar, app load hone pe

    const value={
        currentUser,
        setCurrentUser // dono share hongi
    }

    return <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
}