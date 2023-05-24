"use strict";

import * as Express from "express";

import { QuestionModel } from "../model/questionModel";
import { STATUS_OK, STATUS_BAD_REQUEST, CONTENT_APPLICATION_JSON, STATUS_INTERNAL_SERVER_ERROR } from "../utils";
import { AuthMiddleware } from "../auth";

export class QuestionController {

    public static questionModel: QuestionModel = new QuestionModel();

    /**
     * Register all the routes for the user controller
     * @param app Express application
     * @param path Path for the user controller
     */

    public registerController(app: Express.Express, path: string): void {
        app.get(path + '/', AuthMiddleware.checkToken, this.getQuestions.bind(this));
    }

    public getQuestions(request: any, response: Express.Response): void {

        QuestionController.questionModel.getQuestions();
        response.status(STATUS_OK);
        response.contentType(CONTENT_APPLICATION_JSON);
        response.json({ "code": STATUS_OK, "message": "Questions retrieved" });
        return;
    
    }

}
