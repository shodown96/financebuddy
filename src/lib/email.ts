"use server"

import fs from "fs";
import axios from 'axios';
import nodemailer from 'nodemailer';
import { originURL } from '@/lib/constants/paths';
import { APP_NAME } from "@/lib/constants/app";

const pathKVP = {
    contact: '/templates/contact.html',
}

type PathKVPType = keyof typeof pathKVP


const fetchHTML = async (url: string) => {
    const result = await axios.get(`${originURL}${url}`)
    return result.data
}


interface HTMLEmailProps {
    email?: string,
    subject: string,
    params: Record<string, string>,
    emailType: PathKVPType
}

const {
    EMAIL_CONTACT_ADDRESS,
    NODE_ENV,
    DEBUG,
    EMAIL_HOST,
    EMAIL_USER,
    EMAIL_PASSWORD,
    EMAIL_FROM,
    BREVO_API_KEY
} = process.env

const sendAPIEmail = async ({ email, subject, message, html }: {
    email: string, subject: string, message?: string, html?: string
}) => {
    const result = await axios.post("https://api.brevo.com/v3/smtp/email", {
        sender: { name: APP_NAME, email: EMAIL_FROM },
        to: [{ email }],
        subject,
        htmlContent: html
    }, {
        // auth: {
        //     username: String(EMAIL_USER),
        //     password: String(EMAIL_PASSWORD),
        // }
        headers: {
            "api-key": BREVO_API_KEY
        }
    })
    console.log("result.status", result.status)
    return result.status === 201
}

export const sendHTML = async ({
    email = String(EMAIL_CONTACT_ADDRESS),
    subject,
    params,
    emailType,
}: HTMLEmailProps) => {
    let htmlTemplate = "";
    if (DEBUG === "true") {
        const filePath = `public${pathKVP[emailType]}`
        htmlTemplate = fs.readFileSync(filePath, "utf-8");
    } else {
        htmlTemplate = await fetchHTML(pathKVP[emailType]);
    }
    // const htmlTemplate = await fetchHTML(pathKVP[emailType]);
    // Replace template placeholders with dynamic data
    const fullParams:any = { ...params, appName: APP_NAME }
    const filledTemplate = htmlTemplate.replace(/{{(\w+)}}/g, (match: string, p1: string) => {
        return fullParams[p1] || match;
    });
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASSWORD,
            },
        });

        const sent = await transporter.sendMail({
            from: `${APP_NAME} <${EMAIL_FROM}>`,
            to: email,
            subject: subject,
            html: filledTemplate,
            replyTo: email === EMAIL_CONTACT_ADDRESS ? undefined : EMAIL_CONTACT_ADDRESS
        });
        // const sent = await sendAPIEmail({
        //     email: email,
        //     subject: subject,
        //     html: filledTemplate,
        // })
        if (sent) {
            // if (NODE_ENV === 'development') {
            console.log('[email]: Email sent sucessfully!');
            // }
            return true
        }
    } catch (error) {
        // if (NODE_ENV === 'development') {
        console.log('[email]: Email not sent!', error);
        // }
        return false
    }
};

export const sendPlainEmail = async ({ email, subject, text }: {
    email: string,
    subject: string,
    text: string
}) => {
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASSWORD,
            },
        });

        const sent = await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: subject,
            text: text,
        });
        if (sent) {
            return true
        }
    } catch (error) {
        return false
    }
};


// const mailjet = require('node-mailjet').connect(
//   process.env.MJ_APIKEY_PUBLIC,
//   process.env.MJ_APIKEY_PRIVATE
// )
// const request = mailjet.post('send').request({
//   FromEmail: 'pilot@mailjet.com',
//   FromName: 'Mailjet Pilot',
//   Subject: 'Your email flight plan!',
//   'Text-part':
//     'Dear passenger, welcome to Mailjet! May the delivery force be with you!',
//   'Html-part':
//     '<h3>Dear passenger, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!<br />May the delivery force be with you!',
//   Recipients: [{ Email: 'passenger@mailjet.com' }],
// })
// request
//   .then(result => {
//     console.log(result.body)
//   })
//   .catch(err => {
//     console.log(err.statusCode)
//   })