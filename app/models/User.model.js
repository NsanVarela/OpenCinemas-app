// Utilisation du module npm 'mongoose'
const mongoose = require('mongoose')
const hash = require('../hash')

// Définition du "Schéma" d'un utilisateur
const UserSchema = mongoose.Schema({
	firstname : { type: String, required: true },
	lastname : { type: String, required: [true, `Le champs "NOM" est requis`] },
  // Validateur personnalisé qui vérifie le format d'une adresse e-mail.
  // Basé sur la documentation de mongoose : http://mongoosejs.com/docs/validation.html#custom-validators 
  email : {
    type: String,
    validate: {
      validator: function(mailValue) {
        // c.f. http://emailregex.com/
        const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegExp.test(mailValue);
      },
      message: 'L\'adresse email {VALUE} n\'est pas une adresse RFC valide.'
    }
  },
  salt: { type: String },
  hash: { type: String },

  githubId: { type: String },
  avatarUrl: { type: String },

  // twitterId: { type: String },

});

/*
  Ajout d'une méthode personnalisée "register" pour inscrire un utilisateur
  Cette méthode accepte les 5 paramètres définissant un User
*/
UserSchema.statics.register = function(firstname, lastname, email, pass, pass_confirmation) {
  // Vérification des champs
  const error_messages = []

  if (firstname.trim() === '')
    error_messages.push('Le champs "Prénom" est requis')

  if (lastname.trim() === '')
    error_messages.push('Le champs "Nom" est requis')

  if (pass.trim() === '')
    error_messages.push('Le champs "mot de passe" est requis')
  else if (pass_confirmation.trim() === '')
    error_messages.push('Le champs "confirmation de mot de passe" est requis')
  else if (error_messages.length === 0 && pass.trim() !== pass_confirmation.trim())
    error_messages.push('Les mots de passe doivent être identiques')

  if (email.trim() === '')
    error_messages.push('Le champs "Email" est requis')
  
  if (error_messages.length > 0)
    return Promise.reject(error_messages)

  /*
    Insertion en base, en utilisant la méthode .create() de d'un Model mongoose
    c.f. http://mongoosejs.com/docs/api.html#create_create

    Cette méthode renvoie une Promesse JS. Avec l'instruction 'return', on renvoie donc
    la promesse comme valeur de 'UserSchema.statics.signup'
  */

  // "SELECT * FROM User WHERE email = $email"
  return this.findOne({ email: email })
    .then(user => {
      if (user !== null) {
        return Promise.reject([`Cette adresse email est déjà utilisée (${user.email})`])
      }
    })
    .then(() => hash(pass)) // Hachage du mot de passe de l'utilisateur souhaitant s'inscrire
    .then(({hash, salt}) => { // Affectation par décomposition dans les paramètres (ES6)
      return this.create({
        firstname : firstname,
        lastname  : lastname,
        email     : email,
        salt      : salt,
        hash      : hash
      })
    })
    .catch(errors => {
      // errors peut être de type 'ValidationError' ou un tableau ?

      /*
        ValidationError --> {
          errors : {
            'firstname' : { message: "Champs required"},
            'email' : { message: "RFC invalide"}
            ...
          }
        }

        -->

        ['Champs required', 'RFC invalide']
      */

      // Si l'erreur catchée est une erreur mongoose, on transforme en tableau d'erreurs simple
      if (errors.name === 'ValidationError')
        return Promise.reject( Object.keys(errors.errors).map(field => errors.errors[field].message) )
      else
        return Promise.reject(errors)
              })
}

UserSchema.statics.login = function(email, pass) {

    const error_messages = []

    if (email.trim() === '')
        error_messages.push(`L'adresse email est requise`)
    
    if (pass.trim() === '')
        error_messages.push(`Le mot de passe est requis`)

    if (error_messages.length > 0)
        return Promise.reject(error_messages)


    // 1. Vérifier si l'@ email correspond à un compte
    // 2. Vérifier si le hash du MDP de connexion === à celui dans la base
        // a. re-hacher le MDP transmis en POST
        // b. le comparer avec le hash de la base

    return this.findOne({ email: email })
                .then(user => {
                    if (user === null)
                        return Promise.reject(['Compte inexistant'])
                    return user
                })
                .then(user => {
                    const hashedPassword = user.hash
                    const salt           = user.salt

                    // Recalcul du hash sur le mot de passe en clair (pass)
                    return hash(pass, salt)
                            .then(({hash: computedHash}) => {
                                if (computedHash === hashedPassword)
                                    return Promise.resolve(user)
                                else
                                    return Promise.reject(['Identifiants invalides'])
                            })
                })
}

UserSchema.statics.loginViaGithub = function(profile) {
  
  // Recherche si cet utilisateur (loggué via github) n'est pas déjà dans la base Mongo ?
  return this.findOne({ githubId: profile.id })
              .then(user => {
                // Non ! Donc on l'inscrit dans notre base
                if (user === null) {
                  const [firstname, lastname] = profile.displayName.split(' ')
                  return this.create({
                    githubId: profile.id,
                    firstname: firstname || '',
                    lastname: lastname || '',
                    avatarUrl: profile.photos[0].value // Photo par défaut de l'utilisateur Github
                  })
                }
                else {
                  // On renvoie l'utilisateur trouvé en base
                  return user
                }
              })
}

// UserSchema.statics.loginViaTwitter = function(profile) {
  
//   return this.findOne({ twitterId: profile.id })
//               .then(user => {
//                 if (user === null) {
//                   const [firstname, lastname] = profile.displayName.split(' ')
//                   return this.create({
//                     twitterId: profile.id,
//                     firstname: firstname || '',
//                     lastname: lastname || '',
//                   })
//                 }
//                 else {
//                   return user
//                 }
//               })

// }

// Export du Modèle mongoose représentant un objet User
module.exports = mongoose.model('User', UserSchema);