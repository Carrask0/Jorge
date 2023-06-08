"use strict";

import * as Express from "express";

import { STATUS_OK, STATUS_BAD_REQUEST, CONTENT_APPLICATION_JSON, STATUS_INTERNAL_SERVER_ERROR } from "../utils";
import { AuthMiddleware } from "../auth";
import UserData from "../model/dbUser";

export class QuestionController {

    /**
     * Register all the routes for the user controller
     * @param app Express application
     * @param path Path for the user controller
     */

    public User: any = UserData;

    public registerController(app: Express.Express, path: string): void {
        app.get(path + 'generate', AuthMiddleware.checkToken, this.getQuestions.bind(this));
        app.post(path + 'answer', AuthMiddleware.checkToken, this.postAnswer.bind(this));
    }

    public async getQuestions(request: any, response: Express.Response) {

        const url = 'https://opentdb.com/api.php?amount=10';
        const responseApi = await fetch(url);
        const data = await responseApi.json();
        //For question in data.results data.results[0]['time'] = Date.now();
        data.results[0]['timeStart'] = Date.now();
        request.session.questions = data.results;

        response.status(STATUS_OK);
        response.contentType(CONTENT_APPLICATION_JSON);
        response.json({ "code": STATUS_OK, "message": data.results });
        return;

    }

    public async postAnswer(request: any, response: Express.Response) {

        //Id and answer are sent in the body of the request
        const id: number = request.body.id !== undefined ? request.body.id : null;
        const answer: string = request.body.answer || null;

        if (id == null || answer == null) {
            response.status(STATUS_BAD_REQUEST);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_BAD_REQUEST, "message": "Missing parameters" });
            return;
        }

        console.log(request.session.questions);

        try {
            //Save the answer in the question
            request.session.questions[id]['answer'] = answer;
            request.session.questions[id]['timeEnd'] = Date.now();

            //If id < 9, startTime of the next question is the endTime of the current question
            if (id < 9) {
                request.session.questions[id + 1]['timeStart'] = Date.now();
            } else {
                //Calculate metrics
                //request.session.score = n*e^(-k*t), where n=100*grade; k=0,2; t=time and e=2,71828 (Euler's number)
                ;               // grade = 1 if answer is correct, 0 if answer is incorrect
                // time = timeEnd - timeStart
                request.session.score = 0;
                for (let i = 0; i < 10; i++) {
                    let time = request.session.questions[i]['timeEnd'] - request.session.questions[i]['timeStart'];
                    let grade = request.session.questions[i]['answer'] == request.session.questions[i]['correct_answer'] ? 1 : 0;
                    request.session.questions[i]['score'] = Math.round(100 * grade * Math.pow(2.71828, (-0.2 * time)));
                    request.session.score += request.session.questions[i]['score'];
                }

                //Modify user score if it is higher than the previous one
                //Find user in the database
                const user = await this.User.findOne({ username: request.session.username }).exec();
                if (user) {
                    //If the user exists, check if the score is higher than the previous one
                    if (request.session.score > user.score) {
                        //If it is higher, update the score
                        await this.User.updateOne({ username: request.session.username }, { score: request.session.score }).exec();
                    }
                }

                response.status(STATUS_OK);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_OK, "message": "Answer saved", "score": request.session.score });
                return;
            }

            response.status(STATUS_OK);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_OK, "message": "Answer saved" });
            return;
        } catch (error) {
            console.log(error);
            response.status(STATUS_INTERNAL_SERVER_ERROR);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_INTERNAL_SERVER_ERROR, "message": error });
            return;
        }


    }
}
