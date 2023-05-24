"use strict";

import { STATUS_OK, CONTENT_APPLICATION_JSON } from "../utils";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as mongoose from "mongoose";
import UserData from "../model/dbUser";

export class UserModel {

    public User: any = UserData;

    public async register(username: string, password: string): Promise<String> {

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            const user = new this.User({ username: username, password: hash });
            await user.save();
            return Promise.resolve("User registered");
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async login(username: string, password: string): Promise<String> {

        try {
            //Find user in database
            this.User.findOne({ username: username }, (error: any, user: any) => {
                if (error) {
                    return Promise.reject(error);
                }
                if (!user) {
                    return Promise.reject("User not found");
                }
                //Compare password
                bcrypt.compare(password, user.password, (error: any, result: any) => {
                    if (error) {
                        return Promise.reject(error);
                    }
                    if (!result) {
                        return Promise.reject("Invalid password");
                    }
                });
            }
            );
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(this.generateToken(username));
    }

    public generateToken(username: string): String {

        return jwt.sign({ username: username }, 'secret', { expiresIn: 60 * 60 });
    }
}