const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const Profile = require('./schemas/profile')
const Feedposts = require('./schemas/feedpost')

dotenv.config();

const http = require('http').Server(app);

app.use(cors());

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static('uploads'))




const socketIO = require('socket.io')(http, {
    cors: {
        origin: ['https://socialmediax.netlify.app',"http://localhost:3000"],
        credentials: true
    }
});



socketIO.on('connection', (socket) => {
   

    socket.on('online', async(data) => {
   
      let result = await Profile.find({ email:data.email,uid:data.uid}) 
         if(result.length === 1){
            await Profile.findOneAndUpdate({ email:data.email,uid:data.uid},{online:"online",socketid:socket.id})
            socketIO.emit("onlinerefresh",Math.random())
         }
        if(data.username){
                let result1 = await Profile.find({username:data.username})
                if(result1.length === 1){
                    setTimeout(()=>{
                        socketIO.to(result1[0].socketid).emit('messageread1',{username:result[0].username,value:Math.random()})
                       },2000)
                }
            }
    });


    socket.on("like", async(data) => {
    
            let result = await Profile.find({ email:data.email,uid:data.uid}) 
            if(result.length === 1){
                let result1 = await Feedposts.findById(data.id)
                let result2 = await Profile.find({username:result1.username});
                if(result2.length === 1){
                    
                    if(result2[0].username !== result[0].username && result2[0].socketid !== ''){
                        if(result1.likes.includes(result[0].username) && result2[0].notificationsetting === true){
                        socketIO.to(result2[0].socketid).emit('like1', 
                        {message: `${result[0].username} liked your Post`,
                        id:data.id,
                        title:`${result[0].username} liked your Post`
                    });
                        }
                    }
                }
            }
       
        });

        socket.on("comment", async(data) => {
          
        
                let result = await Profile.find({ email:data.email,uid:data.uid}) 
                if(result.length === 1){
                    let result1 = await Feedposts.findById(data.id)
                    let result2 = await Profile.find({username:result1.username});
                    if(result2.length === 1){
                        
                        if(result2[0].username !== result[0].username && result2[0].socketid !== '' && result2[0].notificationsetting === true){
                
                            socketIO.to(result2[0].socketid).emit('comment1', 
                            {message: `${result[0].username} commented on your Post`,
                            title:`${result[0].username} commented on your Post`,
                            id:data.id});
                            
                        }
                    }
                }
           
            });

            socket.on("sendmessage", async(data) => {
                
            
                    let result = await Profile.find({ email:data.email,uid:data.uid}) 
                    if(result.length === 1){
                        let result2 = await Profile.find({username:data.username});
                        if(result2.length === 1){
                            
                            if(result2[0].username !== result[0].username && result2[0].socketid !== '' && result2[0].notificationsetting === true){
                                 
                                    socketIO.to(result2[0].socketid).emit('sendmessage1',
                                    {message:data.message ,
                                    chatusername:result[0].username,
                                    title:`${result[0].username} sent you a message`
                                   });
                                  setTimeout(()=>{
                                   socketIO.to(result[0].socketid).emit('messageread1',{username:result2[0].username,value:Math.random()})
                                  },2000)
                                  
                                
                              
                                
                            }
                        }
                    }
               
                });

            socket.on("follow", async(data) => {
               
            
                    let result = await Profile.find({ email:data.email,uid:data.uid}) 
                    if(result.length === 1){
                        let result2 = await Profile.find({username:data.username});
                        if(result2.length === 1){
                            
                            if(result2[0].username !== result[0].username && result2[0].socketid !== '' && result2[0].notificationsetting === true){
                                   if(result2[0].followers.includes(result[0].username)){
                                    socketIO.to(result2[0].socketid).emit('follow1', 
                                    {message: `${result[0].username} Following You`,
                                    username:result[0].username,
                                    title:`${result[0].username} Following You`
                                });
                                   }
                                
                                
                            }
                        }
                    }
               
                });

    socket.on("typing",async(data) => {
        let result = await Profile.find({ email:data.email,uid:data.uid});
        if(result.length === 1){
            let result1 = await Profile.find({username:data.username});
            if(result1[0].socketid !== ''){
                if(data.typing){
                    socketIO.to(result1[0].socketid).emit('display', {username:result[0].username,typing:true});
                    
                }else{
                    socketIO.to(result1[0].socketid).emit('display', {username:result[0].username,typing:false});
                }
                
            }
        }

        
    });
  
    socket.on('disconnect', async() => {
    
      let d = Date.now();
            await Profile.findOneAndUpdate({ socketid:socket.id},{online:d,socketid:''});
            socketIO.emit("onlinerefresh",{status:"success"})
    });
  });

const profile = require('./routers/profile');
app.use('/api/profile',profile)
app.use(express.json({limit: '50mb'}));

const feedpost = require('./routers/feedposts');
app.use('/api/feed',feedpost);

const messenger = require('./routers/messenger');
app.use('/api/messenger',messenger);

mongoose.set('strictQuery', false);
mongoose.connect(process.env.URL,{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log('Database connected')
})
.then(()=>{
    http.listen(process.env.PORT || 4000)
})
.catch((err)=>{
    console.log(err)
})

// app.use(express.static(path.join(__dirname,'Frontend/build/index.html')));
// app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, 'Frontend/build/index.html'), function(err) {
      
//     })
//   })
