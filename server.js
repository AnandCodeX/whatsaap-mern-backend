//importing
import express from "express";
import mongoose from "mongoose"
import Messages from './dbmessages.js'
import Pusher from 'pusher'
import cors from 'cors'

//app config
const app=express();
const port=process.env.PORT||9000;

const pusher = new Pusher({
    appId: '1071692',
    key: '1079210b90960fe2ccbd',
    secret: '567514cb2c6dd6c537be',
    cluster: 'ap2',
    encrypted: true
  });

//middleware
app.use(express.json());
app.use(cors())

/* app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*")
    res.setHeader("Access-Control-Allow-Headers","*")
    next();
}) */

//DB config
const connection_url='Enter URL'
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db=mongoose.connection

db.once('open',()=>{
console.log('DB connected')

const msgCollection = db.collection('messagecontents');
const changeStream = msgCollection.watch();

changeStream.on("change",(change) => {
 console.log("A change occured",change);

if(change.operationType==='insert'){
    const messageDetails = change.fullDocument;
    pusher.trigger('messages','inserted',
    {
        name:messageDetails.name,
        message:messageDetails.message,
        timestamp:messageDetails.timestamp,
        recived:messageDetails.recived
    });
}else{
    console.log('Enter triggering Pusher')
}

});

});


//????

//api routes
app.get("/",(req,res)=>res.status(200).send("hello world"));

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage=req.body

    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)

        }else{
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})

//listen
app.listen(port,()=>console.log(`Listen on locolhost${port}`));
