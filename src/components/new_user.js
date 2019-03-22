import React, { Component } from "react";
import "./login-page.css";
import axios from "axios";
import { Link, Redirect } from "react-router-dom";

// FIXME add ENV_PORT to .env in for react
const ENV_PORT = process.env.ENV_PORT || 5000;
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email_address: "",
      token: null,
      isAuthenticated: false
    };
  }

  handleSubmit = event => {
    event.preventDefault();
  };

  validateForm = () => {
    return this.state.username !== "" && this.state.password !== "";
  };

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  printState = () => {
    console.log(this.state);
  };

  createUser = async () => {
    // FIXME set api url for production
    let url = `${window.location.protocol +
      "//" +
      window.location.hostname +
      ":" +
      ENV_PORT}/API/new_user`;
    let res;
    if (process.env.HEROKU_ENV) {
      url = "https://spider-rest-api.herokuapp.com/API/new_user";
    }
    console.log(url);
    try {
      res = await axios({
        method: "post",
        url,
        timeout: 30000,
        data: {
          user_name: this.state.username,
          password: this.state.password,
          email_address: this.state.email_address
        }
      });
    } catch (error) {
      console.error(error);
      return false;
    }
    console.log(res.data);
    if (!res.data || !res.data.success) {
      return false;
    }
    return true;
  };

  setRedirect = () => {
    this.setState({
      isAuthenticated: true
    });
  };

  renderRedirect = () => {
    if (this.state.isAuthenticated) {
      return <Redirect to="/" />;
    }
  };

  render() {
    this.state.token = window.localStorage.token || null;
    return (
      <div>
        <div className="container">
          <div className="login-wrapper">
            <form className="login-form" onSubmit={this.handleSubmit}>
              {/* <!-- username -->  */}
              <div className="username padding_bottom">
                <label>
                  <span className="entypo-user" />
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={this.state.username}
                  onChange={this.handleChange}
                />
              </div>
              {/* <!-- email address -->  */}
              <div className="username">
                <label>
                  <span className="entypo-mail" />
                </label>
                <input
                  type="text"
                  id="email_address"
                  placeholder="Email"
                  value={this.state.email_address}
                  onChange={this.handleChange}
                />
              </div>
              {/* <!-- password --> */}
              <div className="password">
                <label>
                  <span className="entypo-lock" />
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </div>
              {/* <!-- button --> */}
              <button
                className="btn"
                disabled={!this.validateForm}
                onClick={event => {
                  this.printState();
                  let response = this.createUser();
                  if (response) {
                    this.setRedirect();
                  }
                }}
                type="submit"
              >
                {this.renderRedirect()}
                Sign Up
              </button>
              <p>
                Already a member?{" "}
                <span className="link">
                  <Link to="/">
                    Log in now <span className="entypo-right-thin" />
                  </Link>
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
