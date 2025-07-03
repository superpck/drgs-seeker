require('dotenv').config({ debug: false });
// หรือใช้
// require('dotenv').config({ silent: true });
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import helmet from "helmet";
import cors from "cors";

const app: Application = express();
app.use(helmet());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.text({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(cors());

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const router = require('./router');
app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});