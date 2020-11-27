const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

// FAT routes
router.use(/\/fat/, (req, res, next) => {	
	require(`./fat/routes`)(req, res, next);
})

router.get('/', (req, res, next) => {
	res.redirect(`/${req.version}/start`)
})

function cyaRedirect(page, req, res){
	if(req.session.data['cya'] == 'true'){
		req.session.data['cya'] = 'false'
		res.redirect('check-your-answers')
	} else {
		res.redirect(page)
	}
}

router.post('/standard-details', (req, res, next) => {
	cyaRedirect('training-location', req, res)
})

router.post('/training-location', (req, res, next) => {
	cyaRedirect('how-many-apprentices', req, res)
})

router.post('/how-many-apprentices', (req, res, next) => {
	cyaRedirect('start-date', req, res)
})

router.post('/start-date', (req, res, next) => {
	cyaRedirect('recruitment-required', req, res)
})

router.post('/recruitment-required', (req, res, next) => {
	cyaRedirect('organisation-name', req, res)
})

router.post('/organisation-name', (req, res, next) => {
	cyaRedirect('contact-details', req, res)
})

router.post('/contact-details', (req, res, next) => {
	cyaRedirect('check-your-answers', req, res)
})

router.post('/check-your-answers', (req, res, next) => {
	res.redirect('confirmation-page')
})

module.exports = router