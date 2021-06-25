const _log = require('firebase-functions').logger.log
//sconst reModel = require('../models/model')
const _express = require('express')

class AuthsController {
    constructor() {
        if (this.instance) return this.instance
        AuthsController.instance = this
        this.model = require('../models/auth_model')
        this.router = _express.Router()
        this.models = require('../models/model')

        // Sign up controller
        this.router.post('/signup', async (req, res, next) => {
            try {
                const { email, password } = req.body
                const result = await this.model.signup(email, password)
                if (!result) return res.sendStatus(400)
                return res.status(201).json(result)
            } catch (e) {
                return next(e)
            }
        })

        // Sign in controller
        this.router.post('/signin', async (req, res, next) => {
            try {
                const { email, password } = req.body
                const result = await this.model.signin(email, password)
                if (!result) return res.sendStatus(403)
                // const o = await this.model.get("users", result)
                // return res.json(o)
                return res.json(result)
            } catch (e) {
                return next(e)
            }
        })
    }
}

// Verify Access Token. A middleware. not attached to the router
//  If the token is verified, it will be attached to the req to 
//  be passed to next middlewares

async function verifyAccessToken(req, res, next) {
    try {
        const authModel = require('../models/auth_model')
        const verifiedToken = await authModel.verifyHTTPToken(req)

        //_log('auths_controller.js > verifyAccessToken: ', {authModel, req} )

        if (verifiedToken) {
            req.user = verifiedToken // To pass the token the next middleware
            return next()
        }
        else return res.sendStatus(403)
    }
    catch (e) {
        return next(e)
    }
}

// Verify User Access. A middleware. not attached to the router
//  To verify whether the user id from the request match with
//  the user id in the access token

async function verifyUserCanAccessResource(req, res, next) {
    try {
        const authModel = require('../models/auth_model')

        //_log('auths_controller.js > verifyUserCanAccessResource > 1: ', {authModel, req} )

        const verifiedToken = await authModel.verifyHTTPUserCanAccessResource(req)

        //_log('auths_controller.js > verifyUserCanAccessResource > 2: ', {verifiedToken} )

        if (verifiedToken) {
            req.user = verifiedToken // To pass the token the next middleware
            return next()
        }
        else return res.sendStatus(403)
    }
    catch (e) {
        return next(e)
    }
}

// Verify Admin Access.
//  To verify whether the user has admin access. This info is stored in
//  firestore collection 'admins'

async function verifyAdminAccess(req, res, next) {
    try {
        const authModel = require('../models/auth_model')

        _log('auths_controller.js > verifyAdminAccess > 1: ', {authModel, req} )

        const verifiedToken = await authModel.verifyHTTPAdminAccess(req)

        _log('auths_controller.js > verifyAdminAccess > 2: ', {verifiedToken} )

        if (verifiedToken) {
            req.user = verifiedToken // To pass the token the next middleware
            return next()
        }
        else return res.sendStatus(403)
    }
    catch (e) {
        return next(e)
    }
}


const authsRouter = new AuthsController().router
module.exports = {
    authsRouter,
    verifyAccessToken,
    verifyUserCanAccessResource,
    verifyAdminAccess
}