const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const path = require("path");

require("dotenv").config();

const nodemailer = require("nodemailer");

app.use(express.json());
app.use(express.urlencoded());

app.use(express.static(path.resolve(__dirname, "./projects/portfolio/build")));
app.use(express.static(path.resolve(__dirname, "./public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./projects/portfolio/build/index.html"));
});
app.use(
    "/simulations",
    express.static(path.resolve(__dirname, "./projects/simulations"), {
        extensions: ["html", "htm"],
    })
);
app.get("/simulations", (req, res) => {
    res.sendFile(path.join(__dirname, "./projects/simulations/index.html"));
});

app.post("/email", async (req, res) => {
    try {
        const email = req.body.email;
        const message = req.body.message;
        const name = req.body.name;
        const phone = req.body.phone;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Johnny Form" <${process.env.EMAIL_FROM}>`, // sender address
            to: `${process.env.EMAIL_TO_1}, ${process.env.EMAIL_TO_2}`, // list of receivers
            subject: "Form submit from charlieberens.org", // Subject line
            text: `Email: ${email}\nPhone: ${phone}\nName: ${name}\n\n${message}`, // plain text body
        });
        res.sendStatus(200);
    } catch {
        res.sendStatus(400);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
