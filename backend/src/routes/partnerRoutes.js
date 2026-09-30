const express = require('express')
const router = express.Router()
const partnerController = require('../controller/partnerController')
const { authenticate, authorize, optionalAuth, optionalAuth } = require('../middleware/auth')

router.get('/', partnerController.getAll)
router.get('/:id', partnerController.getById)
router.post('/submit', optionalAuth, partnerController.submitForm)
router.get('/my-requests', authenticate, partnerController.getMyRequests)
router.put('/:id', authenticate, authorize('admin'), partnerController.update)
router.patch('/:id/verify', authenticate, authorize('admin'), partnerController.verify)
router.delete('/:id', authenticate, authorize('admin'), partnerController.delete)

module.exports = router;