import Express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { AddScoreRequest, GetScoresRequest } from "./API.js";
import { Db, MongoClient, ObjectId } from "mongodb";

export class Application {
    private app: Express.Application;
    db: Db;

    constructor(db: MongoClient) {
        this.app = Express();
        this.db = db.db("scores");
    }

    setupRoutes() {
        let app = this.app;
        app.use(bodyParser.json());
        app.use(cors({
            origin: "*"
        }));

        app.get("/", (req, res) => {
            let body = req.body as GetScoresRequest;
            this.db.collection("scores").findOne({ _id: new ObjectId(body.id) }).catch(err => {
                console.error(err);
            }).then(scores => {
                res.json(scores);
            })
        });

        app.post("/register", async (req, res) => {
            let result = await this.db.collection("scores").insertOne({ scores: []});
            res.json({ token: result.insertedId });
        })

        app.post("/", async (req, res) => {
            let body = req.body as AddScoreRequest;

            let result = await this.db.collection("scores").findOne({ _id: new ObjectId(body.id) }).catch(err => {
                res.status(500).send("Error");
            });
            let score = result?.scores[body.username];

            if (!score || score < body.score) {
                this.db.collection("scores").updateOne({ _id: new ObjectId(body.id) }, {
                    $set: {
                        scores: {
                            [body.username]: body.score
                        }
                    }
                });
                res.status(200).send("OK");
                return;
            }
            res.status(200).send("OK");
        });

        app.delete("/", (req, res) => {
            let body = req.body as GetScoresRequest;
            this.db.collection("scores").deleteOne({ _id: new ObjectId(body.id) });
        })
    }

    start() {
        this.setupRoutes();
        this.app.listen(80, () => {
            console.log("Server is running on port 80");
        });
    }
}