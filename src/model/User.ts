import mongoose, { Schema, Document } from "mongoose"
import nodemailer from "nodemailer"

export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required !"],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required !"],
        unique: true,
        match: [/.+\@.+\..+/, "Please use a valid email address !"]
    },
    password: {
        type: String,
        required: [true, "Password is required !"],
    },
    verifyCode: {
        type: String,
        required: [true, "Verify Code is required !"],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "Verify Code Expiry is required !"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema]
})

// post middleware
UserSchema.post("save", async function (doc) {
    try {
        // doc is the document which is created in db
        // console.log("Doc",doc);

        // send mail
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,

            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `True Feedback`,
            to: doc.email,
            subject: "Email Verification",
            html: `<h2>Hello Je</h2>
                    <p>OTP is: ${doc.verifyCode}</p>
                    <p>Please verify your email address by clicking on the following link: 
                    <a href='https://trueefeedback.vercel.app/verify/${doc.username}'>Verify Email</a></p>`,
        })

        // console.log("Info",info);

    } catch (error) {
        console.error(error);
    }
})



const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;