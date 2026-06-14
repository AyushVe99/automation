import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('database.sqlite');
db.run("UPDATE posts SET published = 0, instagram_post_id = NULL WHERE series = 'js-arch'", (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Successfully reset js-arch posts');
  }
});
