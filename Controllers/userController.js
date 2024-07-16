import UserModel from "../Models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/** POST: http://localhost:3010/api/userregister 
* @body : {
    "name": "Sahil Kumar"
    "password" : "admin123",
    "email": "example@gmail.com",
    "phone" : 9814740275,
}
*/
export async function userRegister(req, res) {
    try {
        const { password, name, email, phone } = req.body;

        //check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email })
                .exec()
                .then((email) => {
                    if (email) {
                        reject({ error: "Email already exists!" });
                    } else {
                        resolve();
                    }
                })
                .catch((e) => {
                    reject(new Error(e));
                });
        });

        Promise.all([existEmail])
            .then(() => {
                if (password) {
                    bcrypt
                        .hash(password, 10)
                        .then((hashedPassword) => {
                            const user = new UserModel({
                                password: hashedPassword,
                                username: name,
                                email,
                                phone
                            });

                            user
                                .save()
                                .then((user) => {
                                    const token = jwt.sign(
                                        {
                                            userID: user._id,
                                            email: user.email
                                        },
                                        process.env.JWT_SECRET,
                                        { expiresIn: "24h" }
                                    );
                                    UserModel.updateOne({ email: user.email }, { token })
                                        .exec()
                                        .then(() => {
                                            return res.status(201).send({
                                                msg: "User Registered Successfully",
                                                email: user.email,
                                                token,
                                            });
                                        })
                                        .catch((e) => {
                                            return res
                                                .status(200)
                                                .json({
                                                    success: false,
                                                    message: "Internal Server Error - Error Saving Token",
                                                    e,
                                                });
                                        });
                                })
                                .catch((e) => {
                                    res.status(500).send({ e });
                                });
                        })
                        .catch((e) => {
                            return res.status(500).send({
                                error: "Enable to hashed password",
                            });
                        });
                }
            })
            .catch((e) => {
                return res.status(500).send({ message: "Internal Server Error",e });
            });
    } catch (error) {
        return res
            .status(500)
            .send({ success: false, message: "Internal Server Error" });
    }
}


/** POST: http://localhost:3010/api/login 
* @body : {
    "email" : "example@gmail.com",
    "password" : "admin123",
}
*/
export async function login(req, res) {
	const { email, password } = req.body
	try {
		UserModel.findOne({ email })
			.then((user) => {
				bcrypt
					.compare(password, user.password)
					.then((passwordCheck) => {
						if (!passwordCheck)
							return res
								.status(400)
								.send({ error: "Password does not match" })

						// create jwt token
						const token = jwt.sign(
							{
								userID: user._id,
								email: user.email
							},
							process.env.JWT_SECRET,
							{ expiresIn: '7d' }
						)
						
						UserModel.updateOne({ email }, { token })
						.exec()
						.then(()=>{
							return res.status(200).send({
								msg: 'Login Successful',
								email: user.email,
								token,
							})
						})
						.catch((error)=>{
							return res.status(500).json({ success: false, message: 'Internal Server Error - Error Saving Token', error});
						})
					})
					.catch((error) => {
						return res
							.status(400)
							.send({ error: 'Password does not match' })
					})
			})
			.catch((error) => {
				return res.status(404).send({ error: 'Email not Found' })
			})
	} catch (error) {
		return res.status(500).send(error)
	}
}

export async function ContactUs(req, res) {
    try {
        
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
}