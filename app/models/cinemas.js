const CINEMAS_A_PARIS = require('../data/cinemas.json')
module.exports = function(app) {
    
    /**
     * GET /cinemas
     */
    
    app.use('/cinemas', (req, res, next) => {
        if (!req.user) {
            req.flash('danger', 'Vous devez être connecté pour accéder à cette page')
            res.redirect('/login')
            return;
        }
    
        next()
    })

    app.get('/cinemas', (req, res) => {
        res.render('cinemas')
    })

    /**
     * GET /cinemas/api
     */
    app.get('/cinemas/api', (req, res) => {
        let FILTERED_RESULTS = CINEMAS_A_PARIS;

        // Si le client a envoyé un paramètre pour trier par fauteuils ...
        if(req.query.fauteuils) {
            let filterByFauteuils = customFilter(
                req.query.operation_fauteuils,
                'fauteuils',
                Number(req.query.fauteuils)
            )
            FILTERED_RESULTS = FILTERED_RESULTS.filter(filterByFauteuils)
        }

        // Si le client a envoyé un paramètre pour trier par écrans ...
        if(req.query.ecrans) {
            let filterByEcrans = customFilter(
                req.query.operation_ecrans,
                'ecrans',
                Number(req.query.ecrans)
            )
            FILTERED_RESULTS = FILTERED_RESULTS.filter(filterByEcrans)
        }

        // Si le client a envoyé un paramètre pour trier par arrondissements ...
        if(req.query.arrondissements) {
            FILTERED_RESULTS = FILTERED_RESULTS.filter(cinema => cinema.field.arrondissements = req.query.arrondissements)
        }

        res.json(FILTERED_RESULTS)
    })

    function customFilter(operator, field_name, value) {
        switch(operator) {
            case '>':
                return function(cinema) {
                    return cinema.fields[field_name] > Number(value)
                }
            case '<':
                return function(cinema) {
                    return cinema.fields[field_name] < Number(value)
            }
            case '=':
                return function(cinema) {
                    return cinema.fields[field_name] = value
            }
        }
    }



}
