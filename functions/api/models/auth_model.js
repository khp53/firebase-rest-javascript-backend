const _functions = require('firebase-functions')
const _log = _functions.logger.log

const _firebase = require('./firebase/firebase_admin')
const _axios = require('axios').default
const _AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts'

class AuthModel {
    constructor() {
        if (this.instance) return this.instance
        AuthModel.instance = this
        this.auth = _firebase.auth()
        this.firestore = _firebase.firestore()
    }

    // Refactor the code for signin and signup. They have the same structure of code.
    //  The only difference is the endpoint url.

    async _sign(endpoint, username, password) {
        const url = `${_AUTH_BASE_URL}:${endpoint}?key=API_KEY` //was removed for securityurity
        const headers = { 'Content-Type': 'application/json' }
        const data = {
            'email': username,
            'password': password,
            'returnSecureToken': true
        }

        try {
            const response = await _axios.post(url, data, { headers })
            return response.data
        } catch (e) {
            return null
        }
    }

    async signup(username, password) {
        const signUpResult = await this._sign('signUp', username, password)
        return signUpResult
    }

    async signin(username, password) {
        const signInResult = await this._sign('signInWithPassword', username, password)

        _log('auth_model.js > signin: ', { username, signInResult })

        if (signInResult && signInResult.localId)
            await this._grantUserWithAdminRole(signInResult.localId)

        return signInResult
    }

    // Get a document given its id from the collection
    async get(collection, id) {
        const result = await this.firestore.collection(collection).doc(id).get();
        if (!result.exists) return null; // Record not found
    
        const doc = result.data();
        doc.id = result.id;
        return doc;
      }

    // Add feature - set certain users to be admins. The info about admin is stored firestore collection 'admins'
    // Reference: https://firebase.google.com/docs/auth/admin/custom-claims       
    async _grantUserWithAdminRole(uid) {
        // Check if the user has admin access (in firestore collection admins)
        const ref = this.firestore.collection('admin').doc(uid)
        const doc = await ref.get()

        _log('auth_model.js > _grantUserWithAdminRole: ', { uid, doc, exists: doc.exists })

        if (doc.exists)
            return this.auth.setCustomUserClaims(uid, { admin: true })
    }

    // async signout(uid) {
    //     const result = await this.auth.revokeRefreshTokens(uid)
    //     return result
    // }

    _readTokenFromHTTPRequest(req) {
        if (!req) return null
        if (!req.headers) return null
        if (!req.headers.authorization) return null
        const authorization = req.headers.authorization
        if (!(authorization.startsWith('Bearer '))) return null

        //_log('auths_models.js > _readTokenFromHTTPRequest: ', { req, authorization })

        return authorization.split('Bearer ')[1]
    }

    // Generic verifyToken function. Can be used either for
    //   token from HTTP (i.e. for REST-based controller), and
    //   later from Callable functions

    async verifyToken(accessToken) {
        try {
            const decodedToken = await this.auth.verifyIdToken(accessToken)

            //_log('auths_models.js > verifyToken: ', { accessToken, decodedToken, auth: this.auth })

            return decodedToken
        }
        catch (e) {
            //_log('auth_model.js > error** ', e)
            return null
        }
    }

    async verifyHTTPToken(httpRequest) {
        const accessToken = this._readTokenFromHTTPRequest(httpRequest)

        //_log('auths_models.js > verifyHTTPToken: ', { httpRequest, accessToken })

        if (!accessToken) return null
        return this.verifyToken(accessToken) // return is a decoded token
    }

    async verifyHTTPUserAccess(httpRequest, fn) {
        if (!httpRequest) return null
        if (!fn) return null

        const decodedToken = await this.verifyHTTPToken(httpRequest)

        //_log('auths_models.js > verifyHTTPUserAccess: ', { decodedToken, httpRequest })

        if (!decodedToken) return null
        return fn(httpRequest, decodedToken)
    }

    async verifyHTTPUserCanAccessResource(httpRequest) {

        if (!httpRequest || !httpRequest.params || !httpRequest.params.id) return null

        //_log('auths_model.js > verifyHTTPUserCanAccessResource: ', { httpRequest })

        const fn = async (req, decodedToken) => {
            if (!decodedToken) return null
            const authUserId = decodedToken.user_id  // The token should contain the authenticated user id
            const claimUserId = req.params.id   // 
            //_log('auths_model.js > verifyHTTPUserCanAccessResource > fn:  ', { authUserId, claimUserId, req, token: decodedToken })
            if (claimUserId === authUserId) return decodedToken
            return null
        }

        return this.verifyHTTPUserAccess(httpRequest, fn)
    }

    // Reference: https://firebase.google.com/docs/auth/admin/custom-claims

    async verifyHTTPAdminAccess(httpRequest) {

        if (!httpRequest) return null

        _log('auths_model.js > verifyHTTPAdminAccess: ', { httpRequest })

        const fn = async (_req, decodedToken) => {
            if (!decodedToken) return null
            const isAdmin = decodedToken.admin === true

            _log('auths_model.js > verifyHTTPAdminAccess > fn:  ', { isAdmin, decodedToken })

            return isAdmin ? decodedToken : null
        }

        return this.verifyHTTPUserAccess(httpRequest, fn)
    }

}

module.exports = new AuthModel()