import React, { Component } from "react";
import axios from "axios";
import * as qs from "query-string";

export default class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            phone: "",
            message: "",
            err: "",
            success: false,
        };
    }

    onSubmit = (e) => {
        e.preventDefault();

        if (this.state.phone || this.state.email) {
            if (this.state.phone && !this.verifyPhone(this.state.phone)) {
                this.setState({
                    err: `${this.state.phone} is not a valid phone number`,
                });
            } else if (
                this.state.email &&
                !this.verifyEmail(this.state.email)
            ) {
                this.setState({
                    err: `${this.state.email} is not a valid email`,
                });
            } else if (!this.state.message) {
                this.setState({ err: "Please write a message" });
            } else {
                this.submitForm();
            }
        } else {
            this.setState({ err: "Please enter a valid phone or email" });
        }
    };
    onChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    verifyPhone = (phone) => {
        const re =
            /^[+]?([0-9][\s]?|[0-9]?)([(][0-9]{3}[)][\s]?|[0-9]{3}[-\s.]?)[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
        return re.test(String(phone).toLowerCase());
    };
    verifyEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    submitForm = () => {
        let data = {
            name: this.state.name,
            email: this.state.email,
            phone: this.state.phone,
            message: this.state.message,
        };
        data["form-name"] = "contact-form";

        const axiosOptions = {
            url: "/email",
            method: "post",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: qs.stringify(data),
        };

        axios(axiosOptions)
            .then((res) => {
                this.setState({ success: true });
            })
            .catch((err) => {
                this.setState({
                    err: "An unknown error occured, please try again or email me at charliejberens@gmail.com",
                });
            });
    };

    render() {
        return (
            <>
                {!this.state.success ? (
                    <form
                        id="contact-form"
                        name="contact-form"
                        onSubmit={this.onSubmit}
                        data-netlify="true"
                    >
                        {this.state.err && (
                            <span id="form-err">{this.state.err}</span>
                        )}
                        <input
                            type="hidden"
                            name="form-name"
                            value="contact-form"
                        />
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={this.onChange}
                        />
                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            onChange={this.onChange}
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            onChange={this.onChange}
                        />
                        <textarea
                            name="message"
                            placeholder="Message"
                            onChange={this.onChange}
                        ></textarea>
                        <input className="submit" type="submit" />
                    </form>
                ) : (
                    <div id="contact-form-success">
                        <span>Form submitted succesfully!</span>
                    </div>
                )}
            </>
        );
    }
}
