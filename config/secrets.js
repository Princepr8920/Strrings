
let topSecrets = {
 port :       process.env.PORT  || "4000",
 db_conn :    process.env.DB_CONN  || "mongodb://localhost:27017/HelloDb",
 secret :     process.env.TOP_SECRET  || "main_tenu_samjhawan_ki_na_tere_bina_lagda_ji^%$%&^*&%$@jchdudhikuf",
 client_id :    process.env.CLIENT_ID || "1027477486418-jbm1fbdvisr5ui2t5mn52ea37spnv8v7.apps.googleusercontent.com",
 client_secret :     process.env. CLIENT_SECRET  ||  "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",
  callback_url :    process.env.CALLBACK_URL  ||  "http://localhost:4000/auth/google/callback",
}


module.exports = topSecrets