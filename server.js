const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const app = express();
const env =require("dotenv");
env.config();
 // connect database
const db = new pg.Client({
   user: "postgres",
   host: "localhost",
   database:process.env.DATABASE,
   password:process.env.POSTGRE_PASSWORD,
   port: 5432,
});
db.connect();
const port = 8000;

//Middleware
app.use(bodyParser.urlencoded({extended : true}));
app.use('/public/',express.static( __dirname+'/public/'));
app.set('views', __dirname + '/views');
app.set('view engine','ejs');

//Routes
app.get("/",(req,res)=>{
   res.render("index.ejs");
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});
app.post("/login",async(req,res)=>{
  const email =req.body.email;
    const password = req.body.password;
    if( email.length !==0 && password.length !==0){
      let result = await db.query("SELECT * FROM users WHERE users.email =$1",[email]);
      // console.log(result.rows);
      if(result.length !==0){
          const founduser =result.rows[0];
        if( founduser.password == password){
          const userID = result.rows[0].id;
         res.redirect(`/display?user=${userID}&post=0&item=${userID}`);
        } else{
        const error = " INCORRECT CREDENTIALS";
        res.render("login.ejs",{error :error});
       }
  
      }
     else{
      const error = " INCORRECT CREDENTIALS";
      res.render("login.ejs",{error :error});
     }
    }else{
      const error = "Empty fields .Try again.";
      res.render("login.ejs",{error :error});
    }
    
});
app.post("/signup",async(req,res)=>{
    const email =req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    let result = await db.query("SELECT id FROM users ORDER BY id DESC");
  
    let users = result.rows[0].id;
   const userID = users +1;
   if( email.length !==0 && password.length !==0 & username.length !==0){
       db.query("SELECT * FROM users WHERE users.email =$1 OR users.username =$2",[email,username],).then(result =>{
              if( result.rows.length !==0){
                const error ="Account already exists.Try again with a new username or a email";
                res.render("signup.ejs",{error:error});
              }else{
                throw "e";
              }    
       }).catch(async function(e){
           console.log(e);
          const content = "empty";
         
           await db.query("INSERT INTO users (email ,password,username) VALUES ( $1 ,$2,$3)", [email,password,username]);
           await db.query("INSERT INTO post(user_id,post_id,content) VALUES($1,  $2,$3)",[userID,0,content])
          res.redirect(`/display?user=${userID}&post=0&item=${userID}`);
           });
    }
    else{
      const error ="Empty fields. Try again"
      res.render("signup.ejs",{error:error});
    }   
     
 
   
});
app.post("/create",async(req,res)=>{
    const content = req.body.content;
    const ogUSER = req.body.ogUSER;
    
    let result = await db.query("SELECT * FROM post WHERE user_id = $1 ORDER BY post_id DESC",[ogUSER]);
    // console.log(result);
    let users = result.rows[0]; 
    let post = result.rows;
   const postID = users.post_id +1;
   post.pop();
    if(content.length !==0){
     
      await db.query("INSERT INTO post(user_id ,content,post_id) VALUES($1,$2,$3)",[ogUSER,content,postID]);
      await db.query("INSERT INTO comment(user_id,post_id,comment,commentedBYID) VALUES($1,$2,$3,$4)",[ogUSER,postID,"empty",ogUSER])
      res.redirect(`/display?user=${ogUSER}&item=${ogUSER}&post=0`);
    

    }
    else{
        const error ="Empty posts cant be made";
        res.render("display.ejs",{error:error ,ogUSER:ogUSER, post: post});
    }
  });
app.get("/display",async(req,res)=>{
  const ogUSER = req.query.user;
   const  postID = req.query.post;
   const  userID = req.query.item;
   const result = await db.query("SELECT * FROM post  JOIN users ON users.id = post.user_id WHERE post.content !=$1 ",["empty"]);
   const post = result.rows;
    const result1 = await db.query("SELECT comment,username FROM comment JOIN users ON users.id = comment.commentedBYID WHERE user_id =$1 AND post_id=$2 AND comment !=$3",[userID,postID,"empty"]);
    const comments = result1.rows;
   if(comments.length !==0){
    res.render("display.ejs",{post: post ,ogUSER:ogUSER, comments:comments  });
   }else{
    res.render("display.ejs",{post: post ,ogUSER:ogUSER });
   }
  
});
app.post("/showcomment",async(req,res)=>{
    const ogUSER = req.body.user;
    const postID = req.body.post;
    const userID = req.body.item;
    console.log(req.body);
    res.redirect(`/display?user=${ogUSER}&item=${userID}&post=${postID}`);
      
})
app.post("/comment", async(req,res)=>{
    const postID = req.body.postID;
    const userID = req.body.item
    const comment = req.body.comment;
    const ogUSER = req.body.ogUSER;
    console.log(req.body); // not runnig?
    if( comment.length !==0){
        await db.query("INSERT INTO comment(user_id,post_id,comment,commentedBYID) VALUES($1,$2,$3,$4)",[userID,postID,comment,ogUSER]);
    }

   
    res.redirect(`/display?user=${ogUSER}&item=${userID}&post=${postID}`);
});
app.get("/delete",async(req,res)=>{
    // console.log("hello");
    const ogUSER = req.query.user;
    const postID = req.query.post;
    const userID = req.query.item;
    if(ogUSER === userID){
        await db.query("DELETE FROM post WHERE post.user_id =$1 AND post.post_id =$2",[userID,postID]);
        await db.query("DELETE FROM comment WHERE post.user_id =$1 AND post.post_id =$2",[userID,postID]);
    }
    res.redirect(`/display?user=${ogUSER}`); //link works

});
app.post("/edit",async(req,res)=>{
    // console.log("hello");
    const ogUSER = req.body.user;
    const postID = req.body.post;
    const userID = req.body.item;
    const edit = req.body.edit;
     if( ogUSER === userID){
        await db.query("UPDATE  post SET content =$1 WHERE post.user_id =$2 AND post.post_id =$3",[edit,userID,postID]);
     }
       
    
    res.redirect(`/display?user=${ogUSER}&item=${userID}&post=${postID}`); //link works

});
app.post("/profile",async(req,res)=>{
  
  const ogUSER = req.body.user;
  const postID = req.body.post;
  const userID = req.body.item;
  const result2 = await db.query("SELECT username FROM users WHERE id=$1  ",[userID]);
  const  username= result2.rows[0].username;
  const result = await db.query("SELECT * FROM post WHERE user_id =$1",[userID]);
  const total = result.rows.length;
  const post =result.rows;
  console.log(post);
  const profile ={
    username : username,
    total: total,
    post: post
  };
  res.render("profile.ejs",{profile :profile ,userID: userID ,postID: postID , ogUSER : ogUSER ,post:post});

});
app.listen( port , ()=>{
    console.log(`Server is listening on ${port}`);
});