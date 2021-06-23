class FirebaseAdmin {

    constructor() {

        if (this.instance) return this.instance
        
        FirebaseAdmin.instance = this

        this.admin = require('firebase-admin')

        this.admin.initializeApp({
            credential: this.admin.credential.applicationDefault()
        })
    }

    firestore() {
        return this.admin.firestore()
    }

    auth() {
        return this.admin.auth()
    }
}

module.exports = new FirebaseAdmin()