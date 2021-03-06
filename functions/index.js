const functions = require("firebase-functions");
const express = require("express");
const app = express();
const userRouter = require("./api/controllers/users_controller");
const orgRouter = require("./api/controllers/organization_controller");
const cors = require('cors');
const {authsRouter, verifyAccessToken} = require('./api/controllers/auths_controller');

app.use(express.json());
app.use(cors());
app.use("/users", verifyAccessToken, userRouter);
app.use("/organizations", orgRouter);
app.use('/auths', authsRouter);

exports.api = functions.https.onRequest(app);

// To handle "Function Timeout" exception
exports.functionsTimeOut = functions.runWith({
  timeoutSeconds: 300,
});
