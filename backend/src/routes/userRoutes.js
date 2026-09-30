const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const { authenticate, authorize } = require('../middleware/auth')
const { use } = require('react')

router.get('/', authenticate, authorize('admin'), userController.getAll)
router.get('/:id', authenticate, authorize('admin'), userController.getById)
router.put('/:id', authenticate, authorize('admin'), userController.update)
router.delete('/:id', authenticate, authorize('admin'), userController.delete)

module.exports = router;