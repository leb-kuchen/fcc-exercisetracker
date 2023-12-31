import express from "express"
const app = express()
import cors from "cors"
import bodyParser from "body-parser"
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"
import mongoose from "mongoose"
import {} from "dotenv/config"
import { v4 as uuidv4 } from "uuid"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static("public"))
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const { Schema } = mongoose
const userSchema = new Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true },
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
})
const UserModel = mongoose.model("User", userSchema)

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})
app.post("/api/users", async (req, res) => {
  try {
    let userdata = { username: req.body.username, _id: uuidv4(), log: [] }
    let newUser = new UserModel(userdata)
    await newUser.save()
    res.json({ username: newUser.username, _id: newUser._id }).status(200)
  } catch {
    res.json({ error: "could not register user" }).status(400)
  }
})
app.get("/api/users", async (req, res) => {
  let allUsers = await UserModel.find({}).exec()
  res.json(allUsers)
})
app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    let { description, duration, date } = req.body
    if(date  === undefined) date = new Date()
    date = !isNaD(date) ? date : new Date(date)
    let _id = req.params._id
    let userDb = await UserModel.findById(_id).exec()
    userDb.log.push({ description, date, duration })
    await userDb.save()

    res.json({
      username: userDb.username,
      description,
      duration: Number(duration),
      date: date.toDateString(),
      _id,
    })
  } catch {
    res.json({ error: "could not add exercise" }).status(400)
  }
})
function checkNaN(req, res, next) {
  if (req.query.limit === undefined) return next()
  req.query.limit = Number(req.query.limit)
  if (isNaN(req.query.limit)) {
    return res.json({ limit: "NaN" }).status(400)
  }
  next()
}
function isNaD(d) {
  return !d instanceof Date || isNaN(d)
}
function checkNaD(req, res, next) {
  let { from, to } = req.query
  for (let [k, v] of Object.entries({ from, to })) {
    if (v !== undefined) {
      let newDate = new Date(v)
      if (isNaD(newDate)) {
        return res.json({ [k]: "NaD" }).status(400)
      }
      req.query[k] = newDate
    }
  }
  next()
}
app.get("/api/users/:_id/logs", checkNaD, checkNaN, async (req, res) => {
  try {
    let { from, to, limit, _id: __id } = req.query
    let _id = req.params._id
    let requestedUser = await UserModel.findById(_id)
      .select("-__v")
      .lean()
      .exec()
    requestedUser.count = requestedUser.log.length
    console.log(from, to) 
     let [fromDate, toDate] = [from, to].map(e => e?.getTime?.())
    console.log(fromDate, toDate)
    if(!(fromDate === undefined && toDate === undefined)) {
    requestedUser.log = requestedUser.log.filter(({date})=> {
      date = date.getTime()
      console.log(date)
      return (fromDate === undefined ||fromDate <= date) && (toDate === undefined || toDate >= date)
    })
  }
    if (limit !== undefined) {
      requestedUser.log = requestedUser.log.slice(0, limit)
    }
    requestedUser.log.forEach((e) => {
      e.date = e.date.toDateString()
      delete e._id
    })
    res.json(requestedUser).status(200)
  } catch {
    res.json({ error: "could not get logs" })
  }
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port)
})
