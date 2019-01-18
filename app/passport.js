const GitHubStrategy = require('passport-github').Strategy
// const TwitterStrategy = require('passeport-twitter').Strategy
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User.model')

module.exports = function(passport) {

    /*
        Serialization/Désérialisation de l'objet 'user'
        c.f. http://www.passportjs.org/docs/configure/#sessions
    */
    
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })

    /**
     * Strategy Github
     */

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_URL_CALLBACK
    },
    function(token, tokenSecret, profile, cb) {

        console.log(`Votre utilisateur est connecté avec les infos suivantes :`, profile)

        User.loginViaGithub(profile)
            .then(user => cb(null, user)) // je dis à passport que tout est OK,
            // et je lui fournit un objet user pour qu'il puisse créer la session
            .catch(err => cb(err, false)) // je dis à passport que j'ai rencontré une erreur
            // et qu'il ne doit pas tenter de créer la session, mais indiquer l'erreur au client
    }))

    /** 
     * Strategy Twitter
     */
    // passport.use(new TwitterStrategy({
    //     consumerKey: process.env.TWITTER_CONSUMER_KEY,
    //     consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    //     callbackURL: process.env.TWITTER_URL_CALLBACK
    // },
    // function(token, tokenSecret, profile, cb) {

    //     console.log(`Votre utilisateur est connecté avec les infos suivantes :`, profile)

    //     User.loginViaTwitter(profile)
    //         .then(user => cb(null, user))
    //         .catch(err => cb(err, false))
    // }))

    /**
     * Stratégy Locale
     */

    const localStrategyConfig = {
        usernameField: 'email', // en fonction du name="" du champs input type text
        passwordField: 'pass' // en fonction du name="" du champs input type password
    }

    passport.use(new LocalStrategy(localStrategyConfig, (email, password, done) => {

        // On vérifie ici les identifiants de notre utilisateur...
        User.login(email, password)
            .then(user => {
                // Si on est arrivé jusqu'ici sans erreur, c'est que les identifiants semblent valides.
                // ---> Fin de l'authentification, on transmet l'objet 'user' à la méthode done() de passport, et le middleware `passport.authenticate` répondra avec une nouvelle session user
                done(null, user)
            })
            .catch(error_messages => {
                done(null, false, new Error(error_messages.join('<br>')))
            })
    }))

}