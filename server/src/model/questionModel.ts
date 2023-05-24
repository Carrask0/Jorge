"use strict";

import { STATUS_OK, CONTENT_APPLICATION_JSON } from "../utils";

export class QuestionModel {

    public async getQuestions(): Promise<String> {

        const url = 'https://opentdb.com/api.php?amount=10';

        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            return Promise.resolve("Questions retrieved");
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}