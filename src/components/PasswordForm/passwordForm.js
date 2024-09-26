import React from "react";

const jsonHeader = {'Content-Type': 'application/json'};

class PasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
        this.authCallback = props.authCallback;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.previouslySet = this.previouslySet.bind(this);
        this.checkPassword = this.checkPassword.bind(this);
        this.setPassword = this.setPassword.bind(this);
    };

    handleChange(event) {
        this.setState({ value: event.target.value });
    };

    async previouslySet() {
        var response = await fetch('/chat/passwordPreviouslySet', {
            method: 'POST',
            headers: jsonHeader,
            body: JSON.stringify({ password: this.state.value })
        });
        if (response.status == 200)
            return true;
        else
            return false;
    };

    async checkPassword() {
        console.log('checking', this.state.value);
        var response = await fetch('/chat/checkPassword', {
            method: 'POST',
            headers: jsonHeader,
            body: JSON.stringify({ password: this.state.value })
        });
        if (response.ok)
            return true;
        else
            return false;
    }

    async setPassword() {
        await fetch('/chat/createPassword', {
            method: 'POST',
            headers: jsonHeader,
            body: JSON.stringify({ password: this.state.value })
        });
    }

    async handleSubmit(event) {
        //alert('A Password was submitted: ' + this.state.value);
        event.preventDefault();
        if (await this.previouslySet() && await this.checkPassword()) {
            this.authCallback()
        } else if (!(await this.previouslySet())) {
            await this.setPassword();
            await this.authCallback()
        } else {
            alert('Password is incorrect')
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Password:
                    <input type="password" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

export default PasswordForm