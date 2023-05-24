"use strict";

import Cors from "cors";
import Compression from "compression";
import * as BodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import Express, { application } from "express";
import session from "express-session";
import mongoose from "mongoose";
import UserData from "./model/dbUser";

import { UserController } from "./controller/userController";

export class App {
    private app: Express.Express;

    constructor() {
        this.app = Express();
        this.app.use(Cors({ credentials: true, origin: 'http://localhost:3000' }));
        this.app.use(Compression());
        this.app.use(BodyParser.raw());
        this.app.use(BodyParser.text());
        this.app.use(cookieParser());
        this.app.use(BodyParser.json());
        this.app.use(BodyParser.urlencoded({ extended: true }));
        this.app.use(session({
            secret: 'secret',
            resave: false,
            saveUninitialized: true
        }));

        this.registercontrollers();
        mongoose.connect('mongodb://localhost:27017/MyDatabase');
    }

    public start(): void {
        this.app.listen(5000, () => {
            console.log('Server listening on port 5000');
        });
    }

    private registercontrollers(): void {
        new UserController().registerController(this.app, '/api/user/');
    }
}