const allowedOrigins =  require("./myOrigins")

const corsOptions = {
  origin:((origin,cb)=>{ 
    if(allowedOrigins.indexOf(origin) !== -1 || !origin){ 
      cb(null,true)
    }else{
      cb(new Error("❌ Not allowed by CORS ❌"))
    }
  }),
  optionSuccessStatus:200
}

module.exports = corsOptions