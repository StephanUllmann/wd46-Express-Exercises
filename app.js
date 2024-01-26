// https://learn.wbscodingschool.com/courses/full-stack-web-app/lessons/%F0%9F%92%BB-implementation-of-expressjs/

// Exercise 1
// Basic setup
import express from 'express';
import 'colors';

// Exercise 2
// in ESM ('import' syntax) you don't have access to the current directory path variable __dirname
// so we need to 're-implement' it.
// it is needed for the res.sendFile method, because we need a reliabe path to our file
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(__dirname);

// (old Exercise 6 - now removed)
import methodOverride from 'method-override';

// Exercise 11
import fs from 'fs';
//
const app = express();
const port = process.env.PORT || 3000;

// Exercise 4 - Templating (first part)
// telling express that 'ejs' is my templating language. It will look up files in a 'views' directory automatically
app.set('view engine', 'ejs');

// (old Exercise 6 - removed)
// Usually a Browser can issue only GET and POST requests
// To be more explicit in the intention of a request
// you can override the original method -> see override.html
app.use(express.urlencoded({ extended: true }));
app.use(
  methodOverride((req, res) => {
    console.log(req.body);
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      console.log(method);
      return method;
    }
  })
);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/override.html'));
});

// Exercise 2
// sending an HTML file to the client (the PUT is unusual - more demontration purpose)
app.put('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/hello.html'));
});

// Exercise 3
// sending back json as response
app.delete('/', (req, res) => {
  res.json({ good: 'yep' });
});

// Exercise 4
// Templating with ejs (there are many templating libraries out there you could even use JSX, but it's a bit trickier to set up)
// Why templating? It's also called server-side rendering and has a huge comeback right now with react server components in next.js or little libraries like htmx
// Why bother? A Website can be efficiently loaded by sending a couple of HTML responses instead of a huge react SPA all at once.

// Have a look at the template in views/title.ejs - myTitle gets inserted there
// That is basically the meaning of 'render' here
app.get('/test-ejs', (req, res) => {
  const myTitle = 'Live long and prosper 🖖';
  res.render('title', { myTitle: myTitle });
});

// Exercise 5
// -> views/users.ejs
app.get('/test-ejs2', (req, res) => {
  const users = ['Bob', 'John', 'Jane'];
  res.render('users', { users });
});

// Exercise 6
// see form.html
// First send the form to the client
app.get('/form', (req, res) => {
  console.log(req);
  res.sendFile(path.join(__dirname, '/form.html'));
});
app.post('/showPost', (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

// Exercise 7
app.get('/showPost', (req, res) => {
  console.log(req.query);
  res.json(req.query);
});

// Exercise 8
// Getting data from the URL params
app.get('/number/:id', (req, res) => {
  const { id } = req.params;
  console.log(parseFloat(id));
  if (parseFloat(id)) res.send(`The number is ${id}`);
  else res.send(`${id} is not a number`);
});

// Exercise 9
// You can issue requests from node to other services using fetch or axios
app.get('/postlist', (req, res) => {
  fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then((res) => res.json())
    .then((user) => {
      console.log(user);
      res.render('postlist', { title: user.title, body: user.body });
    })
    .catch((err) => res.status(500).send(err.message));
});

// Exercise 10
// With the 'fs' package node has access to the file system. You can for instance read, write or delete files.
// Here we are adding to the file posts.json new data fetched from the service.

app.get('/postlist/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resp = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const user = await resp.json();

    let jsonStuff;
    // reading the file post.json
    fs.readFile('posts.json', function (err, data) {
      if (err) throw err;
      // putting all information as array in a temporary variable
      jsonStuff = JSON.parse(data);
      // if the fetched data isn't already in the data set, we push it into the temporary array
      const isStored = jsonStuff.findIndex((user) => user.id === +id);
      if (isStored === -1) {
        jsonStuff.push(user);
        // Writing the addended data into the file
        fs.writeFile('posts.json', JSON.stringify(jsonStuff), (err) => {
          if (err) throw err;
        });
      }
      res.json(jsonStuff);
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Testing pm2 start app.js --watch
app.get('/watch', (req, res) => {
  res.send('working...');
});
// pm2 log
// pm2 monit
// pm2 stop app.js

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`.rainbow);
});
