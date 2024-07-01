import PartnerModel from '../Models/partner.model.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import path from 'path';
import multer from 'multer';

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/profiles'); // Set upload directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

// Multer upload middleware
const upload = multer({ storage, fileFilter });

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
        upload.single('avatar')(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ success: false, message: 'File upload error' });
            } else if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }

            const { password, fname, lname, email, mobile, role, exp, state, city, cond1, cond2 } = req.body;
            const avatar = req.file ? req.file.filename : null;

            // Check for existing email
            PartnerModel.findOne({ email })
                .then((existingPartner) => {
                    if (existingPartner) {
                        return res.status(400).json({ success: false, message: 'Email already exists!' });
                    } else {
                        bcrypt.hash(password, 10)
                            .then((hashedPassword) => {
                                const partner = new PartnerModel({
                                    fname,
                                    lname,
                                    avatar, // Save the filename of the uploaded image
                                    email,
                                    password: hashedPassword,
                                    mobile,
                                    role,
                                    exp,
                                    state,
                                    city,
                                    cond1,
                                    cond2,
                                });

                                partner.save()
                                    .then((savedPartner) => {
                                        const token = jwt.sign(
                                            {
                                                partnerID: savedPartner._id,
                                                email: savedPartner.email,
                                                role: savedPartner.role,
                                            },
                                            process.env.JWT_SECRET,
                                            { expiresIn: '24h' }
                                        );

                                        PartnerModel.updateOne({ email: savedPartner.email }, { token })
                                            .exec()
                                            .then(() => {
                                                res.status(201).json({
                                                    success: true,
                                                    message: 'Partner Registered Successfully',
                                                    email: savedPartner.email,
                                                    role: savedPartner.role,
                                                    token,
                                                });
                                            })
                                            .catch((updateError) => {
                                                res.status(500).json({ success: false, message: 'Error saving token', error: updateError });
                                            });
                                    })
                                    .catch((saveError) => {
                                        res.status(500).json({ success: false, message: 'Error saving partner details', error: saveError });
                                    });
                            })
                            .catch((hashError) => {
                                res.status(500).json({ success: false, message: 'Error hashing password', error: hashError });
                            });
                    }
                })
                .catch((findError) => {
                    res.status(500).json({ success: false, message: 'Error checking email', error: findError });
                });
        });
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

/** GET: http://localhost:3010/api/partnerdetails/:PartnerId */
export async function getPartnerDetails(req, res) {
    try {
        const { PartnerId } = req.params;

        const partner = await PartnerModel.findById({ _id: PartnerId }).exec();

        if (!partner) {
            return res.status(404).json({ success: false, message: 'Partner Not Found' });
        }

        const { password, ...partnerData } = partner.toObject();

        if (partnerData.avatar) {
            partnerData.avatar = `${process.env.BASE_URL}/uploads/profiles/${partnerData.avatar}`
        }

        return res.status(200).json({ success: true, partner: partnerData });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
}

/** GET: http://localhost:3010/api/allpartner */
export async function getAllPartners(req, res) {
    try {
        const partners = await PartnerModel.find().exec();

        const sanitizedPartners = partners.map(partner => {
            const { password, ...partnerData } = partner.toObject();

            if (partnerData.avatar) {
                partnerData.avatar = `${process.env.BASE_URL}/uploads/profiles/${partnerData.avatar}`
            }

            return partnerData;
        })

        return res.status(200).json({ success: true, partners: sanitizedPartners });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
}