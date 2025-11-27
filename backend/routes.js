const {app, server, mongoose, jwt, bcrypt} = require("./import")
server()
const {User, Course} = require("./schema")
const {auth, token} = require("./middleware")


app.post("/signup", async (req,res)=>{
    const {username, password} = req.headers
    const email = req.body.email
    let obj={
        email: email,
        username: username,
        password: await bcrypt.hash(password, 10),
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

app.post("/login",(req,res,next)=>{
    let pwd= req.headers.password
    let em = req.body.email
    if(!em || ! pwd)
    {
        res.status(400).json({message:false}); return;
    }
    next()
}, token)


app.post("/wallet/add", auth, async (req,res)=>{
    let amt = req.body.amount
    let user = await User.findOneAndUpdate({email: req.email},{ $inc: { wallet: amt } },{new:true})
    // if(user== null)
    // {
    //     res.status(400).
    // }
    res.status(200).json({message: true, amount: user.wallet})
})

// 4. courses admin only
app.post("/courses", auth, async (req,res)=>{
    let { title, description, price } = req.body
    if(price==undefined)
    {
        res.status(400).json({message: "Price is mandatory"});
        return;
    }
    let course = await Course.create({
        title: title,
        description: description,
        price: price,
        createdBy: req.id
    })
    res.status(201).json({message: true, courseId: course._id})
})

// 5. PUT (Admin Only + Only the creator admin)

app.put("/courses/:courseId", auth, async (req,res)=>{
    let { title, description, price } = req.body
    let cid= req.params.courseId
    let course=Course.findOne({_id: cid})
    if(req.id!=course.createdBy)
    {
        res.status(400).json({
            "message": "Not allowed. You did not create this course."
        })
        return;
    }
    await Course.findByIdAndUpdate({_id:cid},{title: title,
        description: description,
        price: price
    })
    res.status(201).json({message:true});
})

// 6. # **GET /admin/courses** (Admin Only)
app.get("/admin/courses", auth, async (req,res)=>{
    let arr= await Course.find({createdBy:req.id})
    if(!arr)
    {
        res.status(400).json({message:"No courses available"}); return;
    }
    res.status(200).json({message: arr})
})

// 7. POST /courses (public)
app.get("/courses", async (req,res)=>{
    let arr=await Course.find()
    if(arr.length ==0)
    {
        res.status(200).json({message: "No courses available"}); return;
    }
    res.status(200).json({message: true, courses: arr})
})

// 8.# **POST /courses/:courseId/purchase (User Only)
app.post("/courses/:courseId/purchase", auth, async (req,res)=>{
    let id= req.id;
    let cid = req.params.courseId
    let user = await User.findOne({_id: id})
    let course = await Course.findOne({_id: cid})
    if(course == null)
    {
        res.status(400).json({message:"Course does not exist"}); return;
    }
    else if(course.price> user.wallet)
    {
        res.status(400).json({
            message: "Insufficient balance",
            "wallet": user.wallet ,"price": course.price});
        return;
    }
    user.wallet -=course.price;
    user.purchasedCourses.push(cid);
    await user.save()
    res.status(200).json({
        message: "Course purchased successfully",
        "remainingWallet": user.wallet
    })
})

// 9.# **GET /purchased (User Only)
app.get("/purchased", auth, async (req,res)=>{
    let course= await User.findOne({_id:req.id}).populate("purchasedCourses").exec()
    course = course.purchasedCourses
    if(course.length==0)
    {
        res.status(200).json({message: "No purchased Courses"});
        return;
    }
    res.status(200).json({message: true, courses: course});
})

// 10. GET /me
app.get("/me", auth, async (req,res)=>{
    let user = await User.findOne({_id: req.id})
    console.log(user)
    res.status(200).json(user);
})