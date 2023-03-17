const express = require("express");
require('dotenv').config()
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();



app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(multer().any());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("MongoDb is Connected"))
  .catch((err) => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, () => {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

