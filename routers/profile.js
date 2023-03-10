const express = require('express');
const router = express.Router();
const Profile = require('../schemas/profile')
const Feedposts = require('../schemas/feedpost')
const Message = require('../schemas/message')
const fs = require('fs');
const { join } = require('path');


// const folderPath = "../profilepic";
// fs.mkdirSync(folderPath);
// app.use(express.static('profilepic'))

router.post('/addprofile', async (req, res) => {
    const { email, uid, username, firstname, lastname, status, profilepic } = req.body;

    try {
         if(username.length > 3 && username.length <= 12 && !/[A-Z]/.test(username) && !/[" "]/.test(username) && email.length > 3 && uid.length >3){

        

        let result1 = await Profile.find({ email })
        let result2 = await Profile.find({ uid })
        let result3 = await Profile.find({ username })
        // console.log(username.length)
        if (result1.length === 0) {
            if (result2.length === 0) {
                if (result3.length === 0 ) {


                    let doc = new Profile({
                        email, uid, username, firstname, lastname, status, profilepic,online:"online",socketid:""
                    });
                    await doc.save();
                    res.json({message:"success"});
                } else {
                    res.json({"message":"username already exist"})
                }
            } else {
                res.json({"message":"token not matched"})
            }

        } else {
            res.json({"message":"email already exist"})
        }
    } }
    catch {
        (err) => {
            console.log(err)
        }
    }

})

router.post('/usernamecheck',async(req,res)=>{
    try{
        let {username} = req.body;
        let result = await Profile.find({ username })
        if(result.length === 0){
            res.json({"message" :"username available"})
        }else{
            res.json({"message" :"username Not available"})
        }
    }catch{(err)=>{
        console.log(err)
    }}
    
})

router.post('/usercheck',async(req,res)=>{
    try{
        let {email,uid} = req.body;
        let result = await Profile.find({ email,uid})
        if(result.length === 1){
            res.json({"message" :"user available"})
        }else{
            res.json({"message" :"user not available"})
        }
    }catch{(err)=>{
        console.log(err)
    }}
    
})

router.post('/getuser',async(req,res)=>{
    try{
        let {email,uid} = req.body;
        let result = await Profile.find({ email,uid})
        if(result.length === 1){
         let res1=   result[0].notifications.filter((val)=>{
                return val.read === false
            })
            let mes = await Message.find({to: result[0].username,read:false })
            res.json({
                "message" :"user available",
                "username": result[0].username,
                "firstname": result[0].firstname,
                "lastname":result[0].lastname,
                "status":result[0].status,
                "profilepic":result[0].profilepic,
                "followers":result[0].followers,
                "following":result[0].following,
                "notificationunread":res1.length,
                "messageunread":mes.length,
        
        })
        }else{
            res.json({"message" :"user not available"})
        }
    }catch{(err)=>{
        console.log(err)
    }}
    
})

router.post('/updateprofile', async (req, res) => {
    const { email, uid, firstname, lastname, status, profilepic } = req.body;

    try {
         
        let result1 = await Profile.find({ email })
        let result2 = await Profile.find({ uid })
        
        if (result1.length === 1) {
            if (result2.length === 1) {
               

                const filter = { uid };
                const update = { firstname, lastname, status, profilepic};
                let doc = await Profile.findOneAndUpdate(filter, update);
                await doc.save();
                    res.json({message:"success"})
                }
            } else {
                res.json({"message":"token not matched"})
            }

        
     }
    catch {
        (err) => {
            console.log(err)
        }
    }

})



router.post('/getprofile',async(req,res)=>{
    try{
        let {email,uid,username,limit} = req.body;
        let result1 = await Profile.find({ email,uid})
        let doc = await Feedposts.find({username}).sort({ _id: -1 }).limit(limit);
        let doc2 = await Feedposts.find({username}).sort({ _id: -1 })
        if(result1.length === 1){
            let result = await Profile.find({username})
            if(result.length === 1){
                
            res.json({
                "message" :"user available",
                "username": result[0].username,
                "firstname": result[0].firstname,
                "lastname":result[0].lastname,
                "status":result[0].status,
                "profilepic":result[0].profilepic,
                "followers":result[0].followers,
                "following":result[0].following,
                "myusername":result1[0].username,
                "posts":doc,
                "postlength":doc2.length
        
        })
        }else{
            res.json({"message" :"user not available"})
        }}
    }catch{(err)=>{
        console.log(err)
    }}
    
})

router.post('/follow',async(req,res)=>{
    try{
        let {email,uid,username} = req.body;
        let result1 = await Profile.find({ email,uid}) //crypto me
        if(result1.length === 1){
            let result = await Profile.find({username}) //raja
            if(result.length === 1){
                
            if(result1[0].username !== username){
                // console.log("yes")
                if(result[0].followers.includes(result1[0].username) && result1[0].following.includes(username)){
                    result[0].followers.splice(result[0].followers.indexOf(result1[0].username),1)
                    result1[0].following.splice(result1[0].following.indexOf(username),1)
                    // console.log(result[0].followers)
                    // console.log(result1[0].following)
                    await Profile.findOneAndUpdate({ username}, {followers:result[0].followers});
                    await Profile.findOneAndUpdate({ email,uid}, {following:result1[0].following});
                    res.send("success")
                }else{
                    result[0].followers.push(result1[0].username)
                    result1[0].following.push(username)
                    // console.log(result[0].followers)
                    // console.log(result1[0].following)
                    await Profile.findOneAndUpdate({ username}, {followers:result[0].followers});
                    await Profile.findOneAndUpdate({ email,uid}, {following:result1[0].following});
                    
                    
                        let d = Date.now();
                        let obj = { message: `${result1[0].username} is Following You`,
                          id:result1[0].username,
                          date:d,
                          read:false}
                        let arr1 =[]
                          let result2 = await Profile.find({username:username})
                        //   console.log(username)
                          arr1 = [...result2[0].notifications,obj];
                          await Profile.findOneAndUpdate({username:username},{notifications:arr1});
                         
                      

                    res.send("success")
                }
            }
        }else{
            res.json({"message" :"user not available"})
        }}
    }catch{(err)=>{
        console.log(err)
    }}
    
})


router.get('/profilepic',async(req,res)=>{
    try{
      let result = await Profile.find({ username:req.query.file})
      if(result.length === 1){

        let base64String = result[0].profilepic; // Not a real image
        // Remove header
        let base64Image = base64String.split(';base64,').pop();
        
        fs.writeFile(`./profilepic/${req.query.file}.png`, base64Image, {encoding: 'base64'}, function(err) {
            res.sendFile(join(__dirname, '../profilepic',`${req.query.file}.png`));
        });

       
      }
      
    }catch(err){
      console.log(err)
    }
  })

  router.post('/online',async(req,res)=>{
    try{
       

         let {email,uid,username} =req.body;
         let result = await Profile.find({ email,uid}) //crypto me
         if(result.length === 1){
            
           if(username){
            // await Profile.findOneAndUpdate({ email,uid},{online:"online"}) ;
            let result1 = await Profile.find({ username});
            if(result1.length === 1){
                
                res.send(result1[0].online)
            }
        //    setTimeout(async()=>{
        //     let d = Date.now();
        //     await Profile.findOneAndUpdate({ email,uid},{online:d})
        
        //    },5000)

           }else{
        //     await Profile.findOneAndUpdate({ email,uid},{online:"online"}) 
        //    setTimeout(async()=>{
        //     let d = Date.now();
        //     await Profile.findOneAndUpdate({ email,uid},{online:d})
        //    },5000)
            let result3 = await Profile.find({ online:"online",onlinesetting:true})
            let arr = [];
            result3.map((val)=>{
                if(result[0].username !== val.username){
                    arr.push({username:val.username})
                }
             
            })
            res.send(arr)
           }
           
         }


    }catch(err){
     console.log(err)
    }
})

router.post('/getsettings',async(req,res)=>{
    try{
        let {email,uid} =req.body;
      let result = await Profile.find({ email,uid})
      if(result.length === 1){
       res.send({onlinesetting:result[0].onlinesetting,
        notificationsetting:result[0].notificationsetting,
        username:result[0].username
         })
      }
      
    }catch(err){
      console.log(err)
    }
  })

  router.post('/changesettings',async(req,res)=>{
    try{
        let {email,uid,change} =req.body;
      let result = await Profile.find({ email,uid})
      if(result.length === 1){
        if(change === "online"){
            if(result[0].onlinesetting === true){
                await Profile.findOneAndUpdate({ email,uid}, {onlinesetting:false});
            }else{
                await Profile.findOneAndUpdate({ email,uid}, {onlinesetting:true});
            }   
        }
        if(change === "notification"){
            if(result[0].notificationsetting === true){
                await Profile.findOneAndUpdate({ email,uid}, {notificationsetting:false});
            }else{
                await Profile.findOneAndUpdate({ email,uid}, {notificationsetting:true});
            }   
        }
       res.send("success")
      }
      
    }catch(err){
      console.log(err)
    }
  })


  router.post('/notifications',async(req,res)=>{
    try{
        let {email,uid} =req.body;
      let result = await Profile.find({ email,uid})
      if(result.length === 1){
        let arr=result[0].notifications;
            for(let i=0;i< arr.length;i++){
                arr[i].read=true;
            }

if(arr.length > 15){
    let arr1 = arr.slice((arr.length - 15),(arr.length))
    // console.log(arr1)
    await Profile.findOneAndUpdate({ email,uid},{notifications:arr1})
}else{
    await Profile.findOneAndUpdate({ email,uid},{notifications:arr});
}
        

       res.send(result[0].notifications)
      }
      
    }catch(err){
      console.log(err)
    }
  })

  router.post('/profiledata',async(req,res)=>{
    try{
        let {email,uid,usernames} =req.body;
      let result = await Profile.find({ email,uid})
      let arr=[]
      if(result.length === 1){
        const finalarr = async()=>{

            for(let i=0;i < usernames.length;i++){
                let result1 = await Profile.find({ username:usernames[i]})

                arr.push({
                    username:result1[0].username,
                    profilepic:result1[0].profilepic,
                    status:result1[0].status,
                })
            }
            res.send(arr)
        }
        finalarr();
        // console.log(arr)
    //    res.send(result[0].notifications)
      }
      
    }catch(err){
      console.log(err)
    }
  })

module.exports = router;