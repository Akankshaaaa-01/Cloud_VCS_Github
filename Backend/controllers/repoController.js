const mongoose=require("mongoose");
const Repository= require("../models/repoModel")
const User=require("../models/userModel")
const Issue=require("../models/issueModel")

const createRepository=async (req,res)=>{

    // const{owner ,name,issues, content, description, visibility}=req.body;

    //owner middleware se lo
    const { name, description, visibility, content } = req.body;
    const owner = req.user; // authenticateMiddleware ne set kiya
   
    try{

    if (!name) {
         return res.status(400).json({message: "Repository name is required"});
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
        return res.status(400).json({ message: "Invalid User ID" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues:[]
    });

    const result= await newRepository.save();

    // User ke repositories array mein bhi add karo
    await User.findByIdAndUpdate(
      owner,
      { $push: { repositories: result._id } }
    );
    
    res.status(201).json({ message:"Repository created !", repositoryID: result._id})

    } catch(err){
        console.error("Error during repository creation: ",err.message);
        res.status(500).json({error: err.message});
    }
}

const getAllRepositories= async(req,res)=>{
    try{
        const repositories= await Repository.find({visibility: true})
        .populate("owner")
        .populate("issues");

        res.json(repositories)

    }catch(err){
        console.error("Error fetching repositories: ",err.message);
        res.status(500).json({error: err.message});
    }
}

const fetchRepositoryById= async(req,res)=>{
    const { id: repoID } = req.params;
    try{
        const repository= await Repository.find({_id:repoID})
        .populate("owner")
        .populate("issues");

        res.json(repository)

    } catch(err){
         console.error("Error fetching repository: ",err.message);
        res.status(500).json({error: err.message});
    }
}

const fetchRepositoryByName=async(req,res)=>{
   const {name: repoName} =req.params
    try{
        const repository= await Repository.find({name:repoName})
        .populate("owner")
        .populate("issues");

        res.json(repository)

    } catch(err){
         console.error("Error fetching repository: ",err.message);
        res.status(500).json({error: err.message});
    }
}

const fetchRepositoriesForCurrentUser=async(req,res)=>{
    const userId=req.params.userID;
    try{

        const repositories= await Repository.find({owner:userId});

        // if(!repositories || repositories.length==0){
        //     return res.status(404).json({error:"User repositories not found"});
        // }

        res.status(200).json({
        message: "Repositories fetched successfully",
        repositories: repositories || []
    });

        
    } catch(err){
         console.error("Error fetching  user repositories: ",err.message);
        res.status(500).json({error: err.message});
    }
}

const updateRepositoryById=async(req,res)=>{
    const {id}=req.params;
    const{content,description}=req.body;

    try{
        const repository= await Repository.findById(id);

        if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
        }

        //  Update fields (only if provided)
        if (content !== undefined) {
        repository.content = content;
        }

        if (description !== undefined) {
        repository.description = description;
        }
        const updatedRepository = await repository.save();

        res.status(200).json({message: "Repository updated successfully",
        repository: updatedRepository
        });

    } catch(err){
         console.error("Error during updating the repository: ",err.message);
        res.status(500).json({error: err.message});
    }
}

const deleteRepositoryById=async(req,res)=>{
    const { id } = req.params;
    try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ message: "Repository not found" });
    }

    // Delete related issues (cascade delete)
    await Issue.deleteMany({ repository: id });

    // OR (if you store issue IDs inside repo)
    // await Issue.deleteMany({ _id: { $in: repository.issues } });

    await Repository.findByIdAndDelete(id);
    res.status(200).json({
      message: "Repository and associated issues deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting repository:", err.message);
    res.status(500).json({ error: err.message });
  }
};


const toggleVisibilityById=async(req,res)=>{
    const {id}=req.params;

    try{
        const repository= await Repository.findById(id);

        if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
        }
        repository.visibility=!repository.visibility;
        const updatedRepository = await repository.save();

        res.status(200).json({message: "Repository visibility toggled successfully",
        repository: updatedRepository
        });

    } catch(err){
         console.error("Error during toggling the visibility: ",err.message);
        res.status(500).json({error: err.message});
    }
}

module.exports={
    createRepository,getAllRepositories,fetchRepositoryById,fetchRepositoriesForCurrentUser
    ,fetchRepositoryByName,updateRepositoryById,deleteRepositoryById,toggleVisibilityById
}