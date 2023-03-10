const express = require('express');
const router = express.Router();
const multer  = require('multer')
const app = express()
const Profile = require('../schemas/profile')
const Feedposts = require('../schemas/feedpost')
const { join } = require('path');
const fs = require('fs')


// app.use('/uploads',express.static(join(__dirname, '../uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() 

      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  })


const upload = multer({ dest: 'uploads/' ,storage:storage});

router.post('/feedpost',upload.single("uploadimage"), async (req, res) => {
    
try{
  let {email,uid,message} =req.body;

  let result = await Profile.find({ email,uid})
        if(result.length === 1){
          let filename ='';
          if(req.file){
            filename = req.file.filename
          }
          if(!req.file && message === ''){
            res.send("invalid")
          }
if(req.file || message !== ''){
  let doc = new Feedposts({
    username:result[0].username,
    message:message,
    filename:filename,
   })
   await doc.save();
  res.send("success");
}
         
        }
    

}catch(err){
    console.log(err)
}
})

router.get('/photos',(req,res)=>{
  try{
    res.sendFile(join(__dirname, '../uploads',`${req.query.file}`));
  }catch(err){
    console.log(err)
  }
})

router.post('/getfeed',async(req,res)=>{
  try{
    let {email,uid,limit}=req.body;
    let result = await Profile.find({ email,uid})
    if(result.length === 1){
      let arr1 =[]
      let doc = await Feedposts.find().sort({ _id: -1 }).limit(limit);
      arr1 =[doc,result[0].username];
      res.send(arr1);
    }
    
  }catch(err){
    console.log(err)
  }
})

router.post('/like',async(req,res)=>{
  try{
    let {email,uid,id} = req.body;
    let result = await Profile.find({ email,uid})
    if(result.length === 1){
     let res1 = await Feedposts.findById(id);
     if(res1.likes.includes(result[0].username)){
      res1.likes.splice(res1.likes.indexOf(result[0].username),1)
     }else{
      res1.likes.push(result[0].username);
      if(result[0].username !== res1.username){
        let d = Date.now();
        let obj = { message: `${result[0].username} liked your Post`,
          id:id,
          date:d,
          read:false}
        let arr =[]
          let result1 = await Profile.find({username:res1.username})
          arr = [...result1[0].notifications,obj];
          await Profile.findOneAndUpdate({username:res1.username},{notifications:arr});
          // console.log(arr)
      }
      
     }
     await Feedposts.findByIdAndUpdate(id,{likes:res1.likes});
     res.send("success")
  }
   }catch(err){
    console.log(err)
   }
})

router.post('/deletefeed',async(req,res)=>{

  try{
    let {email,uid,id} = req.body;
    let result = await Profile.find({ email,uid})
    if(result.length === 1){
      let res1 = await Feedposts.findById(id);
      if(result[0].username === res1.username){
       let result1=await Feedposts.findById(id)
       if(result1.filename){
        fs.unlinkSync(`./uploads/${result1.filename}`)
       }
        await Feedposts.findByIdAndRemove(id);
        res.send("success")
      }
    }

  }catch(err){
    console.log(err)
  }

})

router.post('/commentslist',async(req,res)=>{
  try{
    let {email,uid,id}=req.body;
    let result = await Profile.find({ email,uid})
    if(result.length === 1){
      let doc = await Feedposts.find({_id:id})
      res.send([doc[0],result[0].username]);
    }
    
  }catch(err){
    console.log(err)
  }
})

router.post('/addcomment',async(req,res)=>{
  try{
    let {email,uid,id,comment}=req.body;
    let result = await Profile.find({ email,uid})
    if(result.length === 1){
      let doc = await Feedposts.find({_id:id})
      let arr = doc[0].comments;
      let d = Date.now();
      arr.push({username:result[0].username,comment:comment,date:d})
      await Feedposts.findByIdAndUpdate(id,{comments:arr});


      if(result[0].username !== doc[0].username){
        let d = Date.now();
        let obj = { message: `${result[0].username} commented your Post`,
          id:id,
          date:d,
          read:false}
        let arr1 =[]
          let result1 = await Profile.find({username:doc[0].username})
          arr1 = [...result1[0].notifications,obj];
          await Profile.findOneAndUpdate({username:doc[0].username},{notifications:arr1});
          // console.log(arr)
      }


      res.send("success")
    }
    
  }catch(err){
    console.log(err)
  }
})

router.post('/deletecomment',async(req,res)=>{
  try{
    let {email,uid,id,date}=req.body;
    let result = await Profile.find({ email,uid})
    if(result.length === 1){
      let doc = await Feedposts.find({_id:id})
      let arr = doc[0].comments;
      // arr.push({username:result[0].username,comment:comment,date:d})
      // arr.splice(arr.indexOf(result[0].username),1)
      let arr1 =[];
      arr.map((val)=>{
        if(val.date !== date){
arr1.push(val)
        }
      })
      // console.log(arr1)
      await Feedposts.findByIdAndUpdate(id,{comments:arr1});
      res.send("success")
    }
    
  }catch(err){
    console.log(err)
  }
})

router.post('/likedlist',async(req,res)=>{
  const {email,uid,id}=req.body;
  let result = await Profile.find({ email,uid})
  let arr=[];
      if(result.length === 1){
          let results = await Feedposts.find({ _id:id})
          if(results.length === 1){
          let arrlikes = results[0].likes
          // console.log(arrlikes)
          const finalresult =async()=>{
              for(let i=0 ;i< arrlikes.length;i++ ){
                  let results1 = await Profile.find({ username:arrlikes[i]})
                  // console.log(results1[0].status)
                  arr.push({profilepic:results1[0].profilepic,
                           status:results1[0].status,
                           username:results1[0].username
                  
                  })
              }
              res.send(arr)   
          }
          finalresult();  
      }
      }
})


module.exports = router;