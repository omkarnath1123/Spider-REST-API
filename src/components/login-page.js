import React, { Component } from "react";
import "./login-page.css";

class Login extends Component {
  render() {
    return (
      <div>
        <div class="container">
          <div class="login-wrapper">
            <form class="login-form">
              {/* <!-- username -->  */}
              <div class="username">
                <label>
                  <span class="entypo-user" />
                </label>
                <input type="text" placeholder="Username" />
              </div>
              {/* <!-- password --> */}
              <div class="password">
                <label>
                  <span class="entypo-lock" />
                </label>
                <input type="password" placeholder="Password" />
              </div>
              {/* <!-- button --> */}
              <button class="btn">Sign in</button>
              <p>
                Not a member?{" "}
                <a href="#" class="link">
                  Sign up now <span class="entypo-right-thin" />
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
