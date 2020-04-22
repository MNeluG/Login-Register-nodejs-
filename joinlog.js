if (process.env.node_env !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const app = express();
const mariadb = require('mariadb');
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const override = require('method-override'
)
const initializePassport = require('./password-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

app.use(express.static(__dirname + '/LogBackEnd'))
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(override('_method'))

//--Connection to DataBase--
/*const pool = mariadb.createPool({
     host: '127.0.0.1', 
     user:'nelu', 
     password: 'tehnweb',
     database: 'databasetw',
     port: '3307',
     connectionLimit: 5
});
async function asyncFunction() {
  let conn;
  try {
	conn = await pool.getConnection();
	const rows = await conn.query("SELECT * FROM mytable");
	console.log(rows); 
	const res = await conn.query("INSERT INTO mytable value (?, ?)", [1, "mariadb"]);
	console.log(res); 

  } catch (err) {
	throw err;
  } finally {
	if (conn) return conn.end();
  }
}*/
//--Finish DataBase connection--

//Caz in care user-ul exista si este autentificat,trece la pagina welcome.ejs
app.get('/', checkAuthenticated, (req, res) => {
    res.render('./welcome.ejs', {name: req.user.name})
})
//Pagina de logare
app.get('/login', (req, res) => {
    res.render("log.ejs");
})
//Caz in care user-ul nu exista,nu s-a autentificat,trece inapoi la pagina login
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//Pagina de inregistrare
app.get('/join',checkNotAuthenticated,  (req, res) => {
    res.render("join.ejs");
})
//Preluarea datelor pentru inregistrate din input-uri si introducerea in array-ul user
app.post('/join',checkNotAuthenticated,  async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
            })
        res.redirect('/login')
    } catch {
        res.redirect('/join')
    }
    console.log(users)
})
//Dupa logout,redirectioneaza pe pagina login
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

//functia de autentificare, cazul autentificarii reusite
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

app.listen(3310, () => {
    console.log('--Server start at PORT 3310--');
});