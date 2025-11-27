const { JWT_KEY, jwt} = require("./import");

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
                res.status(400).json({message:"user unauthorised"}); return;
            }
        }
        next()
    })
}

module.exports={ auth}