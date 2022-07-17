 
let getUserByEmail = (User) => async ({email})=>{
  return await User.findOne({email})
 }
 
 
 let newGoogleUser = (User) => ({id, email, username, picture, provider,joined_At})=>{
   const newUser = new User({id,
    username,
    picture,
    email,
    provider,
    joined_At
   })
   return newUser.save()
 }
 

module.exports = (User)=>{
  return {
  newGoogleUser: newGoogleUser(User),
  getUserByEmail: getUserByEmail(User)
 }
}
 