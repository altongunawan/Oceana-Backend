const Router = require("express").Router()
const UserSchema = require('../../schema/user-schema')
const PostSchema = require('../../schema/post-schema')
const ChatSchema = require('../../schema/chat-schema')

Router
    .get('/', async (req, res) => {
        let {nama} = req.query
        try {
            let nama_q = await UserSchema.find({
                nama: {
                    "$regex": nama,
                    "$options": "i"
                  }
            })
            return res.status(200).send(nama_q)
        } catch(e) {
            console.log(e)
            return res.status(200).send(e)
        }
    })
    .post('/authentication', async (req, res) => {

        try {
            console.log(req.body)
            let { email_address, password } = req.body
                
            const user = await UserSchema.findOne({ email_address: email_address }).select('+password')
            if (!user) return res.status(402).json({ msg:'Invalid Credentials' }); 

            const checkPassword = await user.comparePassword(password)
            if(!checkPassword){
                console.log(`password : ${checkPassword}`)
                return res.status(402).json({ msg:'Invalid Credentials' });
            }
            
            const token = await user.createJWT()
            console.log(user, token)
            return res.status(200).json({ user, token });
            
        } catch (e) {
            return res.json({ error_msg: e })
        }
    })
    .post('/register', async (req, res) => {

        let { nama, email_address, password } = req.body
        console.log(req.body)
        try {
            const checkuserAlreadyExists = await UserSchema.findOne({ email_address })
            if (checkuserAlreadyExists) return res.status(401).json({ msg: 'Email sudah digunakan!'});            
            // const user = await UserSchema.create({nama, email, password})

            const user = new UserSchema({
                nama: nama,
                email_address: email_address,
                password: password
            })

            await user.save( async (err, doc) => {
                if(err) console.log("Error save ; " , err)
                if (err) return res.status(500).json(err)
                const token = await user.createJWT()
                return res.status(201).json({ user, token });
            })

        } catch (e) {
            console.log(e)
            return res.json({ error_msg: e })
        }   
    })
    .get('/post', async (req,res) => {
        try {
            const returnData = await PostSchema.find({}).sort({createdAt : "descending"});
            return res.status(201).json( returnData );
        } catch (e) {
            console.log(e)
            return res.json({ error_msg: e })
        }
    })
    .post('/post', async (req,res) => {
        let { nama, email_address,  content } = req.body
        console.log(req.body)
        try {
            const post = new PostSchema({
                nama, email_address, content
            })
            await post.save( async (err, doc) => {
                if (err) return res.json(err)

                const returnData = await PostSchema.find({}).sort({createdAt : "descending"});
                return res.status(201).json( returnData);
            })

        } catch (e) {
            console.log(e)
            return res.json({ error_msg: e })
        }
        
    })
    .post('/like', async (req,res)=>{
        let { id, email_address } = req.body
        try{
            const result = await PostSchema.findOne({post_id: id});
            let likes = result.like
            let ada = await Promise.all(
                likes.filter(e => e.email_address.includes(email_address))
            )
            if(ada.length > 0){
                await PostSchema.updateOne( { post_id: id}, { $set: { like: [] } 
                });
                console.log('Gad')
            }else{
                await PostSchema.updateOne( { post_id: id}, { $push: { like: {
                        email_address
                    } } 
                });
                console.log('Tes')
            }
            result.save((err, doc) => {
                if(err){
                    console.log(err)
                }
                console.log(doc)
                return res.status(200).json( {data: doc, msg: "Sukses"});
            })
        }catch(e){
            console.log(e)
            return res.json({ error_msg: e })
        }
    })
    .post('/comment', async (req, res) => {
        let { id, email_address, nama, content } = req.body
        try{
            const result = await PostSchema.findOne({post_id: id});
            if(!result){
                return res.status(404).send({msg: "Post tidak ditemukan!"})
            }
            let idComment = result.comment.length + 1
            await PostSchema.updateOne( { post_id: id}, { $push: { 
                comment: {
                    id: idComment,
                    nama,
                    email_address,
                    content
                }}
            });
            const returnData = await PostSchema.find({}).sort({createdAt : "descending"});
            return res.status(201).json( returnData );
        }catch(e){
            console.log(e)
            return res.json({error_msg: e})
        }
    })
    .delete('/comment', async (req, res)=>{
        let { id, email_address } = req.body
        try{
            const result = await PostSchema.findOne({post_id: id});
            if(!result){
                return res.status(404).send({msg: "Post tidak ditemukan!"})
            }
            await PostSchema.update({ post_id:id }, 
                { $pull: { comment: { id: id } } } 
            )    
            const returnData = await PostSchema.find({}).sort({createdAt : "descending"});
            return res.status(201).json( returnData );
        }catch(e){
            console.log(e)
            return res.status(500).json({error_msg: e})
        }
    })
    .post('/chat', async (req,res)=>{
        let { participant } = req.body
        try{
            let beebop = await ChatSchema.create({
                participant
            })            
            return res.status(201).send(beebop)
        }catch(e){  
            console.log(e)
            return res.status(500).json({error_msg: e})
        }
    })
    .get('/bookmark/:email' , async (req,res )=>{
        let { email } = req.params
        try{
            const result = await UserSchema.findOne({email_address: email});

            if(!result){
                return res.status(404).send({msg: "Post tidak ditemukan!"})
            }
            let bookmarks = result.bookmark
            let returnData = await Promise.all(
                bookmarks.map(async (e) => {
                    const result = await PostSchema.findOne({post_id: e});
                    return result
                })
            ) 
            console.log(returnData)
            return res.status(200).json( returnData );
        }catch(e){
            console.log(e)
            return res.status(500).json({error_msg: e})
        }
    })
    .post('/bookmark' , async (req,res )=>{
        let { id, email } = req.body
        try{
            const result = await UserSchema.findOne({email_address: email});
            if(!result){
                return res.status(404).send({msg: "Post tidak ditemukan!"})
            }
            await UserSchema.update(
                { email_address: email }, 
                { $push: { bookmark: id } } 
            )    
            return res.status(200).json( {msg: "Sukses"} );
        }catch(e){
            console.log(e)
            return res.status(500).json({error_msg: e})
        }
    })
    .post('/chat/conversation', async (req,res)=>{
        let { participant } = req.body
        try{
            let newData = await ChatSchema.create({
                participant
            })            
            return res.status(201).send( newData )
        }catch(e){  
            console.log(e)
            return res.status(500).json({error_msg: e})
        }
    })
    .post('/friend', async (req,res)=>{
        let {emaila, emailb } = req.body
        try{
            console.log("Friend : ", req.body)
            const resulta = await UserSchema.findOne({email_address: emaila});
            const resultb = await UserSchema.findOne({email_address: emailb});
            if(!resulta || !resultb){
                return res.status(404).send({msg: "User tidak ditemukan!"})
            }
            await UserSchema.update(
                { email_address: emaila }, 
                { $push: { friends: emailb } } 
            )    
            await UserSchema.update(
                { email_address: emailb }, 
                { $push: { friends: emaila } } 
            )    
            return res.status(200).send({msg: "Berhasil menambahkan teman! yay!"})
        }catch(e){
            console.log(e)
            return res.status(200).send(e)
        }
    })

module.exports = Router