import "./Signin.css";
import SigninForm from "./SigninForm";

function Signin() {
  return (
    <div className="container">
      <div className="content">
        <div className="side-content">
          <div className="logo">logo</div>
          <h1 className="welcome">Welcome</h1>
          <p>Content</p>
        </div>
        <div className="sign-in-form">
          <SigninForm />
        </div>
      </div>
    </div>
  );
}

export default Signin;
