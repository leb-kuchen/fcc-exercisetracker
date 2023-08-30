import express from 'express'
const app = express()
import cors from 'cors'
import bodyParser from "body-parser"
import path from "path"
import {fileURLToPath, pathToFileURL} from "url"
import mongoose from "mongoose"
import {} from "dotenv/config"
import {v4 as uuidv4} from "uuid"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))

let __id = "4373f08d-0e52-47e0-aac4-515d565ef932"

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
const {Schema} = mongoose
const userSchema = new Schema({
  _id: {type: String, required: true},
  username: {type: String, required: true},
  log: [{
    description: String,
    duration: Number,
    date: Date,
  }]
})
const UserModel = mongoose.model("User", userSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post("/api/users",  async (req, res) => {
  try {
  let userdata = {username: req.body.username, _id: uuidv4(), log: []}
  let newUser = new UserModel(userdata)
  await newUser.save()
  res.json({username: newUser.username, _id: newUser._id}).status(200)
  } catch {
    res.json({error: "could not register user"}).status(400)
  }
})
app.get("/api/users", async (req, res) => {
  let allUsers = await UserModel.find({}).exec()
  res.json(allUsers)
})
app.post("/api/users/:_id/exercises", async (req, res) => {
  try{
  let {description, duration, date} = req.body
  date ??= new Date()
  let _id = req.params._id
  let userDb = await UserModel.findById(_id).exec()
  userDb.log ??= []
  userDb.log.push({description, date, duration})
  await userDb.save()
  res.json({description, duration, date, _id: userDb._id, username: userDb.username}).status(200)
  }catch{
    res.json({error: "could not add exercise"}).status(400)
  }
})
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
  let {from, to, limit} = req.query
  let _id = req.params._id
  let requestedUser = await UserModel.findById(_id).select("-__v").exec()
  res.json(requestedUser).status(200)
  } catch {
    res.json({error: "could not get user logs"}).status(400)
  }
})
 const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

