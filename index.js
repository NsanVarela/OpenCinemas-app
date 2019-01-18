require('dotenv').config()

const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')

// Création d'une application express
const app = express()

app.set('view engine', 'pug') // Indique à Express que le moteur de templating à utiliser est "pug"
app.set('views', './views') // Indique à Express que le dossiers contenant les templates est "./views"
app.set('view cache', process.env.NODE_ENV === 'production') // Active le cache sur les vues Pug uniquement lorsque l'application est en production

/** 
 * Configure les middleware de l'application
*/
app.use(express.static(path.join(__dirname, 'public'))) // Middleware pour les fichiers statiques http://expressjs.com/fr/starter/static-files.html
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(session({
  secret: 'opencinema rocks with 3wa', // https://github.com/expressjs/session#secret
  resave: false, // https://github.com/expressjs/session#resave
  saveUninitialized: true, // https://github.com/expressjs/session#saveuninitialized
  cookie: { secure: false } // https://github.com/expressjs/session#cookiesecure
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

/**
 * Configuration des routes de l'application
 */
require('./app/passport')(passport) // <-- créer le fichier ./app/passport.js
require('./app/routes')(app, passport)

/** 
 * Configuration de la connection à la BDD
*/
const connectionString = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
mongoose.connect(connectionString, { useNewUrlParser: true} )
  .then(() => { // Démarrage de l'application
    app.listen(1337, () => {
        console.log('Le serveur écoute sur http://localhost:1337')
    })
  })
  .catch(err => console.error(err.message))