import Express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Db, MongoClient, ObjectId } from "mongodb";

import { Game, PlayerScore } from "./DB.js";

export class Application {
    private app: Express.Application;
    db: Db;

    constructor(db: MongoClient) {
        this.app = Express();
        this.db = db.db("scores");
    }

    checkId(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        try {
            req.body.id = new ObjectId(req.params.id);
        } catch (e) {
            res.status(400).json({ error: "Incorrect id" })
            return;
        }
        next();
    }

    setupRoutes() {
        let app = this.app;
        app.use(bodyParser.json());
        app.use(cors({
            origin: "*"
        }));

        app.get("/", async (req, res) => {
            await this.db.collection("scores").find().toArray().then(result => {
                res.json(result.map(item => ({id: item._id, title: item.title})))
            })
        })

        app.get("/:id", this.checkId, (req, res) => {
            this.db.collection("scores").findOne({ _id: req.body.id }).catch(err => {
                res.status(500).json({
                    error: err
                });
            }).then(scores => {
                if (scores) {
                    res.json(scores?.scores);
                } else {
                    res.sendStatus(404);
                }
            })
        });

        app.post("/register", async (req, res) => {
            if (!req.body.title) {
                res.status(400).json({ error: "Title is null" })
                return;
            }
            let result = await this.db.collection("scores").insertOne({ title: req.body.title, scores: []});
            res.json({ token: result.insertedId });
        })

        app.post("/:id", this.checkId, async (req, res) => {
            let id = req.body.id;
            let body = req.body as PlayerScore;

            let game = (await this.db.collection("scores").findOne({
                _id: id
            })) as Game;
            if (!game) {
                res.sendStatus(404);
                return;
            }

            let oldScore = game.scores.find(item => item.username == body.username);

            if (!oldScore) {
                await this.db.collection("scores").updateOne({ _id: id }, {
// @ts-ignore
                    $push: {
                        scores: {
                            username: body.username,
                            score: body.score
                        }
                    }
                })
            } else if (oldScore.score < body.score) {
                await this.db.collection("scores").updateOne({
                    _id: id,
                    "scores.username": body.username
                }, {
                    $set: { "scores.$.score": body.score }
                })
            }

            res.sendStatus(200);
        });

        app.delete("/:id", this.checkId, (req, res) => {
            this.db.collection("scores").deleteOne({ _id: req.body.id });
        })
    }

    start() {
        this.setupRoutes();
        this.app.listen(80, () => {
            console.log("Server is running on port 80");
        });
    }
}