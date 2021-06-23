const express = require('express')

class Controller {
    constructor(model) {
        this.model = model
        this.router = express.Router()

        // Get all documents
        this.router.get('/', async (req, res, next) => {
            try {
                const result = await this.model.getDocumentList(req.query)
                return res.json(result)
            }
            catch (e) {
                return next(e)
            }
        })

        // Get one document
        this.router.get('/:id', async (req, res, next) => {
            try {
                const result = await this.model.getDocument(req.params.id)
                if (!result) return res.sendStatus(404)
                return res.json(result)
            }
            catch (e) {
                return next(e)
            }
        })


        // Create / add a new document
        this.router.post('/', async (req, res, next) => {
            try {
                const result = await this.model.createDocument(req.body)
                if (!result) return res.sendStatus(409)
                return res.status(201).json(result)
            }
            catch (e) {
                return next(e)
            }
        })

        // Delete
        this.router.delete('/:id', async (req, res, next) => {
            try {
                const result = await this.model.deleteDocument(req.params.id)
                if (!result) return res.sendStatus(404)
                return res.sendStatus(200)
            }
            catch (e) {
                return next(e)
            }
        })

        // Update
        this.router.patch('/:id', async (req, res, next) => {
            try {
                const id = req.params.id
                const data = req.body

                const doc = await this.model.getDocument(id)
                if (!doc) return res.sendStatus(404)

                // Merge existing fields with the ones to be updated
                Object.keys(data).forEach((key) => doc[key] = data[key])

                const updateResult = await this.model.updateDocument(id, doc)
                if (!updateResult) return res.sendStatus(404)

                return res.json(doc)
            }
            catch (e) {
                return next(e)
            }
        })

        // Replace
        this.router.put('/:id', async (req, res, next) => {
            try {
                const updateResult = await this.model.updateDocument(req.params.id, req.body)
                if (!updateResult) return res.sendStatus(404)

                const result = await this.model.getDocument(req.params.id)
                return res.json(result)

            }
            catch (e) {
                return next(e)
            }
        })
    }
}

module.exports = Controller
