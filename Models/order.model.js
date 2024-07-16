import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    purchasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    fname: {
        type: String,
        require: true
    },
});

export default mongoose.model.Orders || mongoose.model('Order',OrderSchema);