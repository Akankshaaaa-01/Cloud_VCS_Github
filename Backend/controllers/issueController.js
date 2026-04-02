const mongoose=require("mongoose");
const Repository= require("../models/repoModel")
const User=require("../models/userModel")
const Issue=require("../models/issueModel")

const createIssue = async (req, res) => {
  try {
    const { title, description, repositoryId } = req.body;

    // req.user — middleware ne set kiya
    const issue = await Issue.create({
      title,
      description,
      repository: repositoryId,
      createdBy: req.user  // ← ab track hoga kisne banaya
    });

    // Repository ke issues array mein bhi push karo
    await Repository.findByIdAndUpdate(
      repositoryId,
      { $push: { issues: issue._id } }
    );

    res.status(201).json({ 
      message: "Issue created successfully", 
      issue 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateIssueById=async (req,res)=>{
    const {id}=req.params;
    const {title, description,status}=req.body;

    try{
        const issue= await Issue.findById(id);
        if(!issue){
            return res.status(404).json({error:"Issue not found !"});
        }

        if (issue.createdBy.toString() !== req.user.toString()) {
        return res.status(403).json({ 
            message: "Access denied. You can only update your own issues." 
        });
        }

        if (title) issue.title = title;
        if (description) issue.description = description;
        if (status) issue.status = status;

        await issue.save();
        return res.json({message:"Issue Updated Successfully !"});

    } catch(err){
        console.error("Error during issue updation: ",err.message);
        res.status(500).json({error: err.message});
    }
}

//bug fix
const deleteIssueById=async (req,res)=>{
    const {id}=req.params;
    try{
        const issue= await Issue.findByIdAndDelete(id);
         if(!issue){
            return res.status(404).json({error:"Issue not found !"});
        }

        if (issue.createdBy.toString() !== req.user.toString()) {
        return res.status(403).json({ 
            message: "Access denied. You can only update your own issues." 
        });
        }

        // Repository ke issues array se bhi hata do — warna dangling reference rahega
        await Repository.findByIdAndUpdate(
        issue.repository,          // issue mein repository id stored hai
        { $pull: { issues: id } }  // array se ye id nikaal do
        );

        return res.json({message:"Issue Deleted Successfully !"});

    }catch(err){
        console.error("Error during issue deletion: ",err.message);
        res.status(500).json({error: err.message});
    }

}

const getAllIssues = async (req, res) => {
  try {
    // repositoryId query parameter se lenge — /issue/all?repositoryId=xyz
    const { repositoryId } = req.query;

    const issues = await Issue.find(
      repositoryId ? { repository: repositoryId } : {}
    );
    // agar repositoryId diya toh filtered, warna sab issues

    res.status(200).json(issues);

  } catch (err) {
    console.error("Error during issues fetching: ", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getIssueById=async(req,res)=>{
    const {id}=req.params;

    try{
        const issue= await Issue.findById(id);
        if(!issue){
            return res.status(404).json({error:"Issue not found !"});
        }
        res.json(issue);
    } catch(err){
        console.error("Error during issue fetching: ",err.message);
        res.status(500).json({error: err.message});
    }
}

module.exports={
    createIssue,updateIssueById,deleteIssueById,getAllIssues,
    getIssueById
}