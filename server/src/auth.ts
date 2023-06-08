"use strict";

import { STATUS_OK, STATUS_BAD_REQUEST, CONTENT_APPLICATION_JSON, STATUS_INTERNAL_SERVER_ERROR, STATUS_FORBIDDEN } from "./utils";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export class AuthMiddleware {

    public static async checkToken(request: any, response: any, next: any) {

        console.log(request.session);  //Session is lost here ?????
        const token = request.session.token;
        if (!token) {
            response.status(STATUS_FORBIDDEN);
            response.contentType(CONTENT_APPLICATION_JSON);
            response.json({ "code": STATUS_FORBIDDEN, "message": "Missing token" });
            return;
        }

        jwt.verify(token, 'secret', (err: any, decoded: any) => {
            if (err instanceof jwt.TokenExpiredError) {
                response.status(STATUS_FORBIDDEN);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_FORBIDDEN, "message": "Token expired" });
                return;
            } else if (err instanceof jwt.JsonWebTokenError) {
                response.status(STATUS_FORBIDDEN);
                response.contentType(CONTENT_APPLICATION_JSON);
                response.json({ "code": STATUS_FORBIDDEN, "message": "Invalid token" });
                return;
            }
            request.user_id = decoded.user_id;
            next();
        });
    }
}

