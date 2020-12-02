const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.get('/', (req, res, next) => {
	res.redirect(`/${req.version}/cohorts-list`)
})

router.post('/contacted-provider', (req, res, next) => {
	res.redirect('provider-details')
})

router.post('/cohort-requirements', (req, res, next) => {
	res.redirect('check-your-answers')
})

router.post('/check-your-answers', (req, res, next) => {
	res.redirect('confirmation-page')
})

module.exports = router