const { jwt, bcrypt, mongoose} = require("./import");
require('dotenv').config({ path: './secrets/.env' });
const JWT_KEY= process.env.JWT_KEY
const {User, Course} = require("./schema")

function auth(req,res,next)
{
    let token=req.headers.token
    if(!token)
    {
        res.status(400).json({message:"Invalid session"}); return;
    }
    jwt.verify(token, JWT_KEY,(err,data)=>{
        if(err)
        {
            if(err==="TokenExpiredError")
            {
                res.status(404).json({message:"Session expired!!"}); return;
            }
            else{
                console.log(err)
                res.status(400).json({message:"user unauthorised"}); return;
            }
        }
        req.email=data.email
        req.id=data.id
        next()
    })
}

async function token(req,res){
    let pwd= req.headers.password
    let em = req.body.email

    let user = await User.findOne({email: em})
    if(!user)
    {
        res.status(404).json({message:"not found"})
        return;
    }
    if(!bcrypt.compareSync(pwd, user.password))
    {
        console.log({hash: user.password,
            input: await bcrypt.hash(pwd,10)
        })
        res.status(400).json({message:false , hi:"hii"})
        return;
    }
    let tkn=jwt.sign({username: user.username, email: em, pwd: user.password, id: user._id}, JWT_KEY, {expiresIn: 5*60})
    res.status(200).json({message: true, token: tkn});

}

module.exports={ auth, token}