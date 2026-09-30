const express = require('express')
const router = express.Router()
const categoryController = require('../controller/categoryController')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/', categoryController.getAll)
router.get('/:id', categoryController.getById)
router.post('/', authenticate, authorize('admin'), categoryController.create)
router.put('/:id',authenticate, authorize('admin'), categoryController.update)
router.delete('/:id', authenticate, authorize('admin'), categoryController.delete)

module.exports = router;