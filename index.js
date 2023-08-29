import express from 'express'
const app = express()
import cors from 'cors'
import bodyParser from "body-parser"
import dotenv from "dotenv"
import path from "path"
import {fileURLToPath, pathToFileURL} from "url"
dotenv.config()
import {Users, User, Exercise} from "./users.js"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const users = new Users()
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post("/api/users", (req, res) => {
  let userdata = users.register(req.body.username)
  res.json(userdata)
})
app.post("/api/users/:_id/exercises", (req, res) => {
  const {description, duration, date} = req.body
  const _id = req.params._id
  console.log(_id, description, duration, date)
  const newUser = users.addExercise(_id, description, duration, date)
  res.json(newUser)
})
 const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})