import React, { Component } from "react";
import "./login-page.css";
import axios from "axios";
const ENV_PORT = process.env.ENV_PORT || 5000;
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      token: null
    };
  }

  handleSubmit = event => {
    event.preventDefault();
  };

  validateForm = event => {
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

  checkUser = async () => {
    let url = `${window.location.protocol +
      window.location.pathname +
      window.location.pathname +
      window.location.hostname +
      ":" +
      ENV_PORT}/API/login`;
    console.log(url);
    let res;
    try {
      res = await axios({
        method: "post",
        url,
        timeout: 30000,
        data: {
          user_name: this.state.username,
          password: this.state.password
        }
      });
    } catch (error) {
      console.error(error);
      return false;
    }
    console.log(res.data);
    if (!res.data.loggedIn && !res.data.token) {
      return false;
    }
    this.setState({ token: res.data.token });
    window.localStorage.setItem("token", this.state.token);
    return true;
  };

  render() {
    return (
      <div>
        <div className="container">
          <div className="login-wrapper">
            <form className="login-form" onSubmit={this.handleSubmit}>
              {/* <!-- username -->  */}
              <div className="username">
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
                onClick={this.checkUser}
                type="submit"
              >
                Sign in
              </button>
              <p>
                Not a member?{" "}
                <a href="#" className="link">
                  Sign up now <span className="entypo-right-thin" />
                </a>
              </p>
            </form>
          </div>
          {/* <!-- /login-wrapper --> */}
        </div>
        {/* <!-- /container --> */}
      </div>
    );
  }
}

export default Login;
