const {JWT_KEY, app, server, mongoose, jwt} = require("./import")
server()
const {User, Course} = require("./schema")
const {auth} = require("./authjwt")


app.post("/signup", async (req,res)=>{
    const {username, password} = req.headers
    const email = req.body.email
    let obj={
        email: email,
        username: username,
        password: password,
        role: "user"
    }

    try{
        let user = new User(obj)
        await user.save()
        res.status(200).json({message:"ok"})
        console.log(user)
    }
    catch(err)
    {
        if (err.name === 'ValidationError' || err.code === 11000) {
            console.log(err)
            return res.status(400).json({ message: err.message });
        }
    }
})
console.log(JWT_KEY)
