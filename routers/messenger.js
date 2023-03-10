const express = require('express');
const router = express.Router();
const app = express()
const Message = require('../schemas/message')
const Profile = require('../schemas/profile')

router.post('/chat', async (req, res) => {
    try {
        let { username, email, uid, limit } = req.body;
        let result = await Profile.find({ email, uid });
        if (result.length === 1) {
            let result1 = await Profile.find({ username });
            if (result1.length === 1) {
                if (result1[0].username !== result[0].username) {
                    let mes = await Message.find({ from: result1[0].username, to: result[0].username })

                    await Message.updateMany({ from: result1[0].username, to: result[0].username, read: false }, { read: true })

                    let mes1 = await Message.find({ from: result[0].username, to: result1[0].username })
                    let arr = [...mes, ...mes1]
                    // res.send(arr.sort().slice(0, limit).reverse())
                    res.send(arr.sort().reverse().slice(0, limit).reverse())
                }

            }
        }
    } catch (err) {
        console.log(err)
    }

})

router.post('/sendmessage', async (req, res) => {
    try {
        let { username, email, uid, message } = req.body;
        let result = await Profile.find({ email, uid });
        if (result.length === 1) {
            let result1 = await Profile.find({ username });
            if (result1.length === 1) {
                if (result1[0].username !== result[0].username) {
                    if (message !== '') {
                        let doc = new Message({
                            from: result[0].username,
                            message: message,
                            to: result1[0].username,
                            read: false
                        })
                        await doc.save();
                        res.send("success");
                    }
                }

            }
        }
    } catch (err) {
        console.log(err)
    }
})

router.post('/messengerlist', async (req, res) => {
    try {
        let { email, uid } = req.body;
        let result = await Profile.find({ email, uid });
        if (result.length === 1) {
            await Message.find({ from: new RegExp(result[0].username) }).distinct('to').exec(async (err, names1) => {
                await Message.find({ to: new RegExp(result[0].username) }).distinct('from').exec(function (err, names2) {
                    let arr = [...names1, ...names2];
                    let uniq = a => [...new Set(a)];
                    let arrlist = uniq(arr);
                    // console.log(arrlist)
                    let arrunread =[]
                    const forloop =async()=>{
                        for(let i=0;i < arrlist.length;i++){
                            var result2 =await Message.find({ from:arrlist[i],to:result[0].username,read:false});


                            let mes = await Message.find({ from: arrlist[i], to: result[0].username })
                            let mes1 = await Message.find({ from: result[0].username, to:arrlist[i] })
                            let arr3 = [...mes, ...mes1]
                            // res.send(arr.sort().slice(0, limit).reverse())
                            let lastmessage = arr3.sort().reverse().slice(0,1).reverse()


                            arrunread.push({username:arrlist[i],
                                unread:result2.length,
                                message:lastmessage[0].message,
                                timestamp:lastmessage[0].createdAt})

                         

                        }
                        res.send(arrunread)
                    }
                    forloop();

                });
            });

        }

    } catch (err) {
        console.log(err)
    }

})


// router.post('/unread', async (req, res) => {
//     try {
//         let { email, uid, username } = req.body;
//         let result = await Profile.find({ email, uid });
//         if (result.length === 1) {
//             let result1 = await Profile.find({ username });
//             if (result1.length === 1) {
//                 if (result1[0].username !== result[0].username) {
//                  let unreadlist = await Message.find({from:result1[0].username,to:result[0].username,read:false})
//                   res.send(unreadlist.length)
//                 }
//             }
//         }}catch (err) {

//         }
//     })

module.exports = router;