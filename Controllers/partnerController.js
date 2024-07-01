import PartnerModel from '../Models/partner.model.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

/** POST: http://localhost:3010/api/partnerregister 
* @body : {
    "fname": "Sahil Kumar",
    "lname": "Sahil Kumar",
    "email": "example@gmail.com",
    "password" : "admin123",
    "mobile" : 9814740275,
    "role" : "Plumber",
    "exp" : 3,
    "state" : "Punjab",
    "city" : "Mohali",
    "cond1" : "Condition 1",
    "cond2" : "Condition 2",
}
*/
export async function partnerRegister(req, res) {
    try {
        const { password, fname, lname, email, mobile, role, exp, state, city, cond1, cond2 } = req.body;

        //check for existing email
        const existEmail = new Promise((resolve, reject) => {
            PartnerModel.findOne({ email })
                .exec()
                .then((email) => {
                    if (email) {
                        reject({ error: "Email already exists!" })
                    }
                    else {
                        resolve()
                    }
                })
                .catch((e) => {
                    reject(new Error(e))
                })
        })

        Promise.all([existEmail])
            .then(() => {
                if (password) {
                    bcrypt
                        .hash(password, 10)
                        .then((hashedPassword) => {
                            const partner = new PartnerModel({
                                password: hashedPassword,
                                fname,
                                lname,
                                email,
                                mobile,
                                role,
                                exp,
                                state,
                                city,
                                cond1,
                                cond2,
                            })

                            partner.save()
                                .then((partner) => {
                                    const token = jwt.sign(
                                        {
                                            partnerID: partner._id,
                                            email: partner.email,
                                            role: partner.role,
                                        },
                                        process.env.JWT_SECRET,
                                        { expiresIn: '24h' }
                                    )
                                    PartnerModel.updateOne({ email: partner.email }, { token })
                                        .exec()
                                        .then(() => {
                                            return res.status(201).send({
                                                msg: 'Partner Registered Successfully',
                                                email: partner.email,
                                                role: partner.role,
                                                token,
                                            })
                                        })
                                        .catch((e) => {
                                            return res.status(200).json({ success: false, message: 'Internal Server Error - Error Saving Token', e });
                                        })
                                })
                                .catch((e) => {
                                    res.status(500).send({ e });
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
                return res.status(500).send({ e });
            })
    } catch (error) {
        return res.status(500).send({ success: false, message: "Internal Server Error" });
    }
}


/** POST: http://localhost:3010/api/partnerlogin 
* @body : {
    "email" : "example@gmail.com",
    "password" : "admin123",
}
*/
export async function partnerLogin(req, res) {
    const { email, password } = req.body
    try {
        PartnerModel.findOne({ email })
            .then((partner) => {
                bcrypt
                    .compare(password, partner.password)
                    .then((passwordCheck) => {
                        if (!passwordCheck)
                            return res
                                .status(400)
                                .send({ error: "Password does not match" })

                        // create jwt token
                        const token = jwt.sign(
                            {
                                partnerID: partner._id,
                                email: partner.email,
                                role: partner.role,
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: '24h' }
                        )

                        PartnerModel.updateOne({ email: partner.email }, { token })
                            .exec()
                            .then(() => {
                                return res.status(201).send({
                                    msg: 'Partner Registered Successfully',
                                    email: partner.email,
                                    role: partner.role,
                                    token,
                                })
                            })
                            .catch((e) => {
                                return res.status(200).json({ success: false, message: 'Internal Server Error - Error Saving Token', e });
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