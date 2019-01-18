const User = require('./models/User.model')

module.exports = function(app, passport) {

  /**
   * Middleware pour afficher la session
  */

  // Ce petit middleware met à disposition des variables pour toutes les 'views' Pug de l'application
  app.use((req, res, next) => {
    app.locals.flashMessages = req.flash() // Consommation des messages flash en session pour affichage
    app.locals.user = req.user // Récupération de l'objet 'user' (sera existant si une session est ouverte, et undefined dans le cas contraire)
    
    next()
  })

  // Empêche l'accès aux pages de connexion/inscription aux utilisateurs déjà connectés
  app.use(['/login', '/register', '/auth/github'], (req, res, next) => {
    if (req.user) {
      req.flash('danger', 'Vous ne pouvez pas accéder à cette page')
      return res.redirect('/')
    }
    else
        next()
  })

  /** 
   * GET /
   *    Accès à la page d'accueil
  */
  app.get('/', (req, res) => {
    res.render('index');
  });

  /**
   * GET /auth.Github
   *    Authentification via Github
  */
  app.get('/auth/github', passport.authenticate('github'))
  app.get('/auth/github/callback', passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: { message: 'Connexion Github réussie!'}
  }))

  /**
   * GET /auth.Twitter
   *    Authentification via Twitter
  */
  // app.get('/auth/twitter', passport.authenticate('twitter'))
  // app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  //   successRedirect: '/',
  //   failureRedirect: '/login',
  //   failureFlash: true,
  //   successFlash: { message: 'Connexion Twitter réussie!'}
  // }))

  /** 
   * GET /login
   *    Connecte l'utilisateur
  */
  app.get('/login', (req, res) => {
    res.render('login');
  });

  /** 
   * GET /logout
   *    Déconnecte l'utilisateur
  */
  app.get('logout', (req, res) => {
    request.logout() // Passport détruit la session
    request.flash('success', 'Vous avez bien été déconnecté(e)')
    response.redirect('/')
  })

  /**
   * GET /logout
   *    Déconnecte l'utilisateur
  */
  app.get('/logout', (request, response) => {
    request.session.destroy()
    response.redirect('/')
  })

  /** 
   * GET /register
   *    Inscrit un nouvel utilisateur
  */
  app.get('/register', (req, res) => {
    res.render('register');
  });

  /** 
   * POST /login
   *    Le client envoie le formulaire de connexion avec des données POST ...
  */
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    badRequestMessage: 'Identifiants invalides',
    failureFlash: true,
    successFlash: { message: 'Connexion réussie !'}
  }))

  /**
  * POST /register
  *     Le client envoie le formulaire d'inscription avec des données POST ...
  */
  app.post('/register', (req, res) => {
    User.register(req.body.firstname, req.body.lastname, req.body.email, req.body.pass, req.body.pass_confirmation)
      .then(() => {
        req.flash('success', 'Inscription réussie, vous pouvez maintenant vous connecter !')
        res.redirect('/') // Redirection vers l'accueil!
      })
      .catch(error_messages => {
        res.render('register', { error_messages, body: req.body })
      })
  })






require('./models/cinemas')(app)

}