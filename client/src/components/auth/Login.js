import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const handelOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handelOnsubmit = async (e) => {
    e.preventDefault();
  };
  return (
    <>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead">
        <i className="fas fa-user" /> Sign Into Your Account
      </p>
      <form className="form" onSubmit={(e) => handelOnsubmit(e)}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => handelOnChange(e)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => handelOnChange(e)}
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </>
  );
};

export default Login;
