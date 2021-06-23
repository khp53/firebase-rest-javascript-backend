// Singleton
class Database{
    constructor(){
        if (this.instance) return this.instance
        Database.instance = this

        const admin = require('firebase-admin')
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        })

        this.firestore = admin.firestore()
        this.firebaseStorage = admin.storage()
        this.auth = admin.auth()
    }

    //CRUD
    //Create a new collection doc id will be auto generated
    async create(collection, document, id) {
        const result = (id !== undefined) ? await this.firestore.collection(collection).doc(id).set(document)
        : await this.firestore.collection(collection).add(document);
        document.id = result.id;
        return document;
      }
    
    //Read full collection
    async getList(collection) {
        const result = await this.firestore.collection(collection).get();
    
        const list = [];
        result.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id;
          list.push(data);
        });
        return list.length ? list : null;
      }
    
    //Read by id a single doc
    async get(collection, id) {
        const result = await this.firestore.collection(collection).doc(id).get();
        if (!result.exists) return null; // Record not found
    
        const doc = result.data();
        doc.id = result.id;
        return doc;
      }
    
    //update a single doc by id
    async set(collection, id, document) {
        const doc = this.firestore.collection(collection).doc(id);
        const result = await doc.get();
    
        if (!result.exists) return null; // Record not found
    
        await doc.set(document);
    
        document.id = id;
        return document;
      }
    
    //delete a doc by id
    async delete(collection, id) {
        const doc = this.firestore.collection(collection).doc(id);
        const result = await doc.get();
    
        if (!result.exists) return null; // Record not found
    
        await doc.delete();
    
        return { id };
      }
}

module.exports = new Database();