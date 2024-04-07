import UserModel from '../Models/user.model';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function userRegister(req,res){
    try {
        const {password,name,email} = req.body;

        //check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({email})
            .exec()
            .then((email) => {
                if(email){
                    reject({error: "Email already exists!"})
                }
                else{
                    resolve()
                }
            })
            .catch((e) => {
                reject(new Error(e))
            })
        })

        Promise.all([existEmail])
            .then(() => {
                if(password){
                    bcrypt
                    .hash(password,10)
                    .then((hashedPassword) => {
                        const user = new UserModel({
                            password: hashedPassword,
                            name,
                            email,
                        })

                        user.save()
                        .then((user) => {
                            const token = jwt.sign(
                                {
                                    userID: user._id,
                                    email: user.email,
                                    role: user.role,
                                },
                                process.env.JWT_SECRET,
                                {expiresIn: '24h'}
                            )
                            UserModel.updateOne({email:user.email}, { token })
                            .exec()
                            .then(() => {
                                return res.status(201).send({
                                    msg: 'User Registered Successfully',
                                    email: user.email,
                                    role: user.role,
                                    token,
                                })
                            })
                            .catch((e) => {
                                return res.status(200).json({success: false, message:'Internal Server Error - Error Saving Token',e});
                            })
                        })
                        .catch((e) => {
                            res.status(500).send({e});
                        })
                    })
                    .catch((e) => {
                        return res.status(500).send({
                            error: "Enable to hashed password",
                        })
                    })
                }
            })
            .catch((e) => {
                return res.status(500).send({e});
            })
    } catch (error) {
        return res.status(500).send({success: false, message: "Internal Server Error" });
    }
}