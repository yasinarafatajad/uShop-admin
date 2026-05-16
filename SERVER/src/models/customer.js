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
            type: mongoose.Schema.Types.Mixed,
            default: {
                street: '',
                city: '',
                district: '',
                postalCode: '',
                country: 'Bangladesh'
            }
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

// Pre-save hook to ensure address is an object
customerSchema.pre('save', function (next) {
    if (typeof this.address === 'string') {
        const addressString = this.address;
        this.address = {
            street: addressString,
            city: '',
            district: '',
            postalCode: '',
            country: 'Bangladesh'
        };
    }
    next();
});

export default mongoose.model('Customer' , customerSchema);