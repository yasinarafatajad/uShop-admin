import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        // Basic Identity
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },

        phone: {
            type: String,
        },
        
        image: {
            type: String,
            default: "https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg",
        },

        // Authentication
        password: {
            type: String,
            required: true,
            default: "00000000",
            minlength: 6,
            select: false, // Do not return password by default
        },
        
        resetPasswordOtp: {
            type: String,
        },
        
        resetPasswordExpires: {
            type: Date,
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },

        // Account Status
        isVerified: {
            type: Boolean,
            default: true,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

        // Address (can expand later)
        address: {
            street: String,
            city: String,
            district: String,
            postalCode: String,
            country: {
                type: String,
                default: "Bangladesh",
            },
        },

        // Order Relation
        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model('Customer' , customerSchema);