import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const PartnerSchema = new mongoose.Schema({
    fname: {
        type: String,
        require: true
    },
    lname: {
        type: String,
        require: true
    },
    avatar:{
        type: String,  //cloudinary url
        require: true
    },
    email: {
        type: String,
        require: true
    },
    mobile: {
        type: Number,
        require: true
    },
    role: {
        type: String,
        require: true
    },
    exp: {
        type: Number,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    cond1: {
        type: String,
        require: true
    },
    cond2: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

PartnerSchema.plugin(mongooseAggregatePaginate)

export default mongoose.model.Partner || mongoose.model('PARTNER',PartnerSchema);