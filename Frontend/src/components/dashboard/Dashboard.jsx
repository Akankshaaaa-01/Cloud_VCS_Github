import {useState,useEffect} from 'react';
import Navbar from '../Navbar';


export default function Dashboard(){

const [repositories,setRepositories]=useState([]);
const [searchQuery,setSearchQuery]=useState("");
const [suggestedRepositories,setSuggestedRepositories]=useState([]);
const [searchResults,setSearchResults]=useState([]);

useEffect( ()=>{

    const userId=localStorage.getItem("userId");

    const fetchRepositories= async()=>{
        try{
            const response =await fetch(`http://localhost:3002/repo/user/${userId}`)
            const data= await response.json();
            setRepositories(data.repositories);
            console.log(repositories);
            
        } catch(err){
            console.error("Error while fetching repositories",err);
        }
       
    };

     const fetchSuggestedRepositories= async()=>{
        try{
            const response =await fetch(`http://localhost:3002/repo/all`)
            const data= await response.json();
            setSuggestedRepositories(data);
            console.log(suggestedRepositories);
        } catch(err){
            console.error("Error while fetching repositories",err);
        }
       
    };
    
    fetchRepositories();
    fetchSuggestedRepositories();
},[])

useEffect (()=>{
    if(searchQuery==""){
        setSearchResults(repositories);
    } else{
        const filteredRepo=repositories.filter((repo)=>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
         setSearchResults(filteredRepo);
    }
},[searchQuery,repositories])

const events = [
  {
    title: "Hackathon 2026",
    date: "April 10",
  },
  {
    title: "Open Source Sprint",
    date: "April 25",
  },
  {
    title: "React Webinar",
    date: "May 02",
  }
];

    return(
        <> <Navbar/>
        <div className="flex gap-6 p-6 bg-gray-900 min-h-screen text-white">

        
        <aside className="w-1/4  p-4">
            <h3 className="text-lg font-semibold mb-3 ">Suggested Repositories</h3>
            {suggestedRepositories.map((repo)=>{
                return (
                    <div key={String(repo._id)} className="bg-slate-800 rounded-lg mb-3 p-3 shadow hover:shadow-lg transition-all">
                        <h4 className="font-medium mb-1">{repo.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{repo.description}</p>
                        <p className="text-xs text-gray-500">Owner: {repo.owner.username}</p>
                    </div>
                )
            })}
        </aside>

        
        <main className="w-2/4  p-4 ">
         <h3 className="text-lg font-semibold mb-3 ">Your Repositories</h3>
         <div className="mb-4">
            <input type="text" placeholder='Find your Repository...' className=" p-1 m-1 rounded  text-black placeholder-gray-500 focus:outline-none  transition"
            value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/>
         </div>
             {searchResults.map((repo)=>{
                return (
                    <div key={String(repo._id)} className="bg-slate-800 rounded-lg mb-3 p-3 shadow hover:shadow-lg transition-all">
                        <h4 className="font-medium mb-1">{repo.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{repo.description}</p>
                    </div>
                )
            })}
        </main>

        
        <aside className="w-1/4  p-4 ">
            
            <h3 className="text-lg font-semibold mb-3 ">Upcoming Events</h3>
            {events.map((event,index)=>(
                <div key={index} className="bg-slate-800 rounded mb-3 p-3 ">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-400">{event.date}</p>
                </div>
            ))}
        </aside>

        </div>
        </>
    )
}