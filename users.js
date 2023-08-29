import {v4 as uuidv4} from "uuid"
export class Users {
    constructor(){
      this.users = new Map()
    }
    register(username) {
      let _id 
      do {
        _id = uuidv4()
      } while (this.hasUser(_id))
      let newUser = new User(_id, username)
      this.users.set(_id, newUser)
      return {username, _id}
    }
    addExercise(_id, description, duration, date) {
      if (!this.hasUser(_id)) {
        console.log(_id)
        console.log("User does not exist")
        return 
      }
      let user = this.users.get(_id)  
      let newExercise = new Exercise(description, duration, date)
      user.push(newExercise)
      return user
    }
    hasUser(_id) {
      return this.users.has(_id)
    }
  }
export class User {
    constructor(_id, username) {
      this.username = username
      this._id = _id
      this.logs = []
    }
    push(it) {
      this.logs.push(it)
    }
  }
export class Exercise {
    constructor(description, duration, date) {
      this.description = description
      this.date = date
      this.duration = duration
    }
  }
 
  
  