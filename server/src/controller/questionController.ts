"use strict";

import * as Express from "express";

import { STATUS_OK, STATUS_BAD_REQUEST, CONTENT_APPLICATION_JSON, STATUS_INTERNAL_SERVER_ERROR } from "../utils";
import { AuthMiddleware } from "../auth";

export class QuestionController {

    /**
     * Register all the routes for the user controller
     * @param app Express application
     * @param path Path for the user controller
     */

    public registerController(app: Express.Express, path: string): void {
        app.get(path + 'generate', AuthMiddleware.checkToken, this.getQuestions.bind(this));
        app.post(path + 'answer', AuthMiddleware.checkToken, this.postAnswer.bind(this));
    }

    public async getQuestions(request: any, response: Express.Response) {

        const url = 'https://opentdb.com/api.php?amount=10';

        try {
            const response = await fetch(url);
            const data = await response.json();
            //For question in data.results data.results[0]['time'] = Date.now();
            data.results[0]['timeStart'] = Date.now();
            request.session.questions = data.results;
        } catch (error) {
            console.log(error);
        }
        
        response.status(STATUS_OK);
        response.contentType(CONTENT_APPLICATION_JSON);
        response.json({ "code": STATUS_OK, "message": "Questions retrieved" });
        return;
    
    }

    public postAnswer(request: any, response: Express.Response): void {

        //Id and answer are sent in the body of the request
        const id: number = request.body.id || null;
        const answer: string = request.body.answer || null;

        if (!id || !answer) {
            response.status(STATUS_BAD_REQUEST);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_BAD_REQUEST, "message": "Missing parameters" });
        }

        console.log(request.session.questions);

        //Save the answer in the question
        request.session.questions[id]['answer'] = answer;
        request.session.questions[id]['timeEnd'] = Date.now();

        //If id < 9, startTime of the next question is the endTime of the current question
        if (id < 9) {
            request.session.questions[id + 1]['timeStart'] = Date.now();
        } else {
            console.log(request.session.questions);
        }
    }
}
