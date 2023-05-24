"use strict";

import * as Express from "express";

import { UserModel } from "../model/userModel";
import { STATUS_OK, STATUS_BAD_REQUEST, CONTENT_APPLICATION_JSON, STATUS_INTERNAL_SERVER_ERROR } from "../utils";
import { AuthMiddleware } from "../auth";

export class UserController {

    public static userModel: UserModel = new UserModel();

    /**
     * Register all the routes for the user controller
     * @param app Express application
     * @param path Path for the user controller
     */

    public registerController(app: Express.Express, path: string): void {
        app.post(path + 'register', this.register.bind(this));
        app.post(path + 'login', this.login.bind(this));
        app.get(path + 'logout', AuthMiddleware.checkToken, this.logout.bind(this));
        app.get(path + 'check', AuthMiddleware.checkToken, this.check.bind(this));
    }

    public register(request: Express.Request, response: Express.Response): void {
        const username: string = request.body.username || null;
        const password: string = request.body.password || null;

        if (!username || !password) {
            response.status(STATUS_BAD_REQUEST);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_BAD_REQUEST, "message": "Missing parameters" });
        }

        UserController.userModel.register(username, password)
            .then((result: any) => {
                response.status(STATUS_OK);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_OK, "message": "User registered" });
                return;
            })
            .catch((error: Error) => {
                response.status(STATUS_INTERNAL_SERVER_ERROR);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_INTERNAL_SERVER_ERROR, "message": error.message });
                return;
            });
    }

    public login(request: any, response: Express.Response): void {

        const username: string = request.body.username || null;
        const password: string = request.body.password || null;

        if (!username || !password) {
            response.status(STATUS_BAD_REQUEST);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_BAD_REQUEST, "message": "Missing parameters" });
        }

        UserController.userModel.login(username, password)
            .then((result: any) => {
                request.session.token = result;
                request.session.start_time = Date.now();
                response.status(STATUS_OK);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_OK, "message": "User logged in"});
                return;
            })
            .catch((error: Error) => {
                response.status(STATUS_INTERNAL_SERVER_ERROR);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_INTERNAL_SERVER_ERROR, "message": error.message });
                return;
            });
    }

    public logout(request: any, response: Express.Response): void {
        console.log("Total time: " + (Date.now() - request.session.start_time) + "ms");
        request.session.token = null;
        request.session.start_time = null;
        response.status(STATUS_OK);
        response.contentType(CONTENT_APPLICATION_JSON);
        response.json({ "code": STATUS_OK, "message": "User logged out" });
        return;
    }

    public check(request: any, response: Express.Response): void {
        response.status(STATUS_OK);
        response.contentType(CONTENT_APPLICATION_JSON);
        response.json({ "code": STATUS_OK, "message": "Token valid" });
        return;
    }
}
