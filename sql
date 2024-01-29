CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT,
    password TEXT
);
INSERT INTO users(email,password) VALUES('abc@gmail.com','12345');
CREATE TABLE post (
   user_id INTEGER,
    post_id INTEGER,
    content TEXT
);
CREATE TABLE comment (
   user_id INTEGER,
    post_id INTEGER,
	commentedBYID INTEGER,
    comment TEXT

     
);
CREATE TABLE likes(
     user_id INTEGER,
    post_id INTEGER,
    like INTEGER,

     
);