const _collectionsJson = {
    users: [
      {
        id: "user1",
        name: "MD Karimul Hasan",
        photoUrl: "http://localhost:9199/v0/b/default-bucket/o/users%2FIMG_9567%20(2).jpg?alt=media&token=b0484cc5-1d47-4a8b-b8ae-755d46b0714d",
        login: "karimul",
        password: "123"
      },
      
    ],
    organizations: [
      {
        id: "org1",
        name: "1 Takay Ahar",
        photoUrl: "http://localhost:9199/v0/b/default-bucket/o/users%2FIMG_9567%20(2).jpg?alt=media&token=b0484cc5-1d47-4a8b-b8ae-755d46b0714d",
        login: "1takaahar",
        password: "123",
        address: "Dhaka, Bangladesh",
        phoneNumber: "01812345678",
        email: "donate@1taka.ahar"
      },
      {
        id: "org2",
        name: "Biddanondon",
        photoUrl: "http://localhost:9199/v0/b/default-bucket/o/users%2FIMG_9567%20(2).jpg?alt=media&token=b0484cc5-1d47-4a8b-b8ae-755d46b0714d",
        login: "biddanondon",
        password: "123",
        address: "Dhaka, Bangladesh",
        phoneNumber: "01812345678",
        email: "donate@biddanondon.com"
      }
    ]
  }
  
  
  const _db = require("../api/database");
  
  async function setupDatabase(_req, res, _next) {
  
    // Start adding the data to the database
    for (const collectionName in _collectionsJson) {
  
      const collectionData = _collectionsJson[collectionName]
  
      for (const documentData of collectionData) {
        if (documentData && documentData.id) {
          const documentId = documentData.id
  
          // id will not be included in the database. it is used only to name the document
          delete documentData.id
  
          const result = await _db.firestore.collection(collectionName).doc(documentId).set(documentData)
          console.log({ documentId, result })
        }
        else {
          await _db.firestore.collection(collectionName).add(documentData)
          console.log('auto gen doc id')
        }
      }
    }
  
    res.send('Setting Up Database.... Done ')
  }
  
  module.exports = setupDatabase