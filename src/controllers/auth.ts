
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


import User from '../models/user';
import ProjectError from '../helper/error';

interface ReturnResponse {
    status: "success" | "error",
    message: String,
    data: {} | []
}




const registerUser = async (req: Request, res: Response, next: NextFunction) => {

    let resp: ReturnResponse;
    try {
        //
        const email = req.body.email;
        const name = req.body.name;
        let password = await bcrypt.hash(req.body.password, 12);


        const user = new User({ email, name, password });
        const result = await user.save();
        if (!result) {
            resp = { status: "error", message: "No result found", data: {} };
            res.send(resp)
        } else {
            resp = { status: "success", message: "Registration done!", data: { userId: result._id } };
            res.send(resp);
        }
    } catch (error) {
        next(error);
    }

}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    let resp: ReturnResponse;
    try {
        const email = req.body.email;
        const password = req.body.password;

        //find user with email
        const user = await User.findOne({ email });

        if (!user) {
            const err = new ProjectError("No user exist");
            err.statusCode = 401;
            throw err;
        }
        //verify password using bcrypt
        const status = await bcrypt.compare(password, user.password);

        //then decide
        if (status) {

            const token = jwt.sign({ userId: user._id }, "secretmyverysecretkey", { expiresIn: '1h' });
            resp = { status: "success", message: "Logged in", data: { token } };
            res.status(200).send(resp);
        } else {
            const err = new ProjectError("Credential mismatch");
            err.statusCode = 401;
            throw err;
        }

    } catch (error) {
        next(error);
    }
}


export { registerUser, loginUser }