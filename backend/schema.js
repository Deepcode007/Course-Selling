const {Schema, mongoose} = require("./import")

const courseSchema= new Schema({
    title: String,
    description: String,
    price: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        immutable: (doc) => doc.role !== 'admin' 
    }
})

const userSchema= new Schema({
    email: {type: String, unique: true },
    username: String,
    password: String,
    role: { type: String, default: "user"},
    wallet: { type: Number, default:0},
    purchasedCourses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }
})

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);   
module.exports = { User, Course}