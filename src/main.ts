import { MongoClient } from "mongodb";
import { Application } from "./Application.js";


const URL = "mongodb://" + "db" + ":" + 27017 + `/directConnection=true`;
const dbClient: MongoClient = await (MongoClient.connect(URL).catch(err => {
    console.log(err);
    process.abort();
}));

const app = new Application(dbClient);
app.start();