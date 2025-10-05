import "./SigninForm.css";

function SigninForm() {
  return (
    <div className="formContainer">
      <form className="form">
        <h1>Sign In</h1>
        <div className="fomrInputs">
          <label htmlFor="email">Email Address</label>
          <input type="email" placeholder="email" id="email" name="email" />
        </div>
        <div className="fomrInputs">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="password"
            id="password"
            name="password"
          />
        </div>
        <div className="fomrInputs">
          <button type="submit">Sign In</button>
        </div>
        <div className="createAccount">
          New User?<a href="#">Create Account</a>
        </div>
        <div className="signinWith">
          <button>Google</button>
          <button>Facebook</button>
          <button>Github</button>
        </div>
      </form>
    </div>
  );
}

export default SigninForm;
