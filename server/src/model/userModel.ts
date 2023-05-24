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
          const user = await this.User.findOne({ username: username }).exec();
          if (!user) {
            return Promise.reject("User not found");
          }
      
          const result = await bcrypt.compare(password, user.password);
          if (!result) {
            return Promise.reject("Invalid password");
          }
      
          return Promise.resolve(this.generateToken(username));
        } catch (error) {
          return Promise.reject(error);
        }
      }
      

    public generateToken(username: string): String {

        return jwt.sign({ username: username }, 'secret', { expiresIn: 60 * 60 });
    }
}