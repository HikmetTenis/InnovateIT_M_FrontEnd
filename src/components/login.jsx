import React, { useState, useContext } from 'react';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { FlexBox, Input, Label, Text, Button, Title, BusyIndicator } from '@ui5/webcomponents-react';
import MessageContext from "../helpers/message-context";
import '@ui5/webcomponents-react/dist/Assets';
import { resetPassword } from '../services/s-account';
import { useAuth } from "../helpers/authcontext";
import CustomError from '../helpers/custom-error';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serviceID, setServiceID] = useState('');
  const { message, setMessage } = useContext(MessageContext);
  const [passwordIcon, setPasswordIcon] = useState('show');
  const [passwordType, setPasswordType] = useState('Password');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    serviceID: ''
  });

  // Initial state for errors
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    serviceID: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Validate on change
    setErrors({ ...errors, [name]: validateField(name, value) });
    if (name === "username") setUsername(e.target.value);
    if (name === "password") setPassword(e.target.value);
    if (name === "serviceID") setServiceID(e.target.value);
  };

  const validateField = (name, value, message) => {
    switch (name) {
      case 'username':
        if (message) return message;
        return value ? '' : 'User Name is required';
      case 'password':
        if (message) return message;
        return value ? '' : 'Password is required';
      case 'serviceID':
        if (message && process.env.REACT_APP_ENVIRONMENT !== "TRIAL") return message;
        return value ? '' : 'serviceID is required';
      default:
        return '';
    }
  };

  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    const newErrors = {};
    let isValid = true;
    for (let field in formData) {
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) isValid = false;
    }
    setErrors(newErrors);
    if (isValid) {
      let sId = process.env.REACT_APP_SERVICE_ID;
      if (process.env.REACT_APP_ENVIRONMENT === "TRIAL") sId = serviceID;
      try {
        const credentials = {
          username: username,
          password: password,
          serviceID: sId,
        };
        const user = await login(credentials); // Handles either JWT or SAML login based on AUTHTYPE
        setDashboardLoading(true);
        if (user.data.isPasswordInitial) {
          window.location.href = "/changePassword";
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        setLoading(false);
        if (err instanceof CustomError) {
          setMessage({ open: false, toastMessage: err.message, result: null, callback: null, toast: true });
        } else {
          if (err.status === 429) {
            setMessage({ open: false, toastMessage: "Account is not active.!", result: null, callback: null, toast: true });
          } else {
            setErrors({
              username: validateField("username", '', 'Login failed, Username may not be correct.'),
              password: validateField("password", '', 'Login failed, Password may not be correct.')
            });
            setMessage({ open: false, toastMessage: "Login failed.!", result: null, callback: null, toast: true });
          }
        }
      }
    } else {
      setLoading(false);
    }
  };

  const resetPasswordDialog = async (e) => {
    e.preventDefault();
    const newErrors = {};
    let isValid = true;
    const error = validateField("username", formData["username"]);
    newErrors["username"] = error;
    if (error) isValid = false;
    setErrors(newErrors);
    if (isValid) {
      setMessage({ open: true, message: "Do you want to reset your password?", result: null, callback: resetPasswordAction, toastMessage: message.toastMessage });
    }
  };

  const resetPasswordAction = async () => {
    try {
      const credentials = { username: username };
      const response = await resetPassword(credentials);
      setMessage({ open: false, toastMessage: "Reset link will be sent to the associated email to the account, if you have account, if you dont receive any email, try to Register..", result: null, callback: null, toast: true });
    } catch (error) {
      setMessage({ open: false, toastMessage: "Something went wrong.!", result: null, callback: null, toast: true });
    }
  };

  const showPassword = () => {
    if (passwordIcon === "show") {
      setPasswordIcon("hide");
      setPasswordType("Text");
    } else {
      setPasswordIcon("show");
      setPasswordType("Password");
    }
  };

  return (
    <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true">
      <FlexBox direction="Row" alignItems="Center" style={{ display: dashboardLoading ? "flex" : "none" }} justifyContent="Center" fitContainer="true">
        <BusyIndicator active={dashboardLoading} style={{ flex: "1" }} size="M"></BusyIndicator>
      </FlexBox>
      <FlexBox direction="Row" alignItems="Center" justifyContent="Center" style={{ display: !dashboardLoading ? "flex" : "none" }} fitContainer="true">
        <Text style={{ top: "10px", position: "absolute", right: "50px" }}>{process.env.REACT_APP_VERSION}</Text>
        <FlexBox direction="Column" alignItems="Center" justifyContent="Center" id="login-picture-wrapper">
          <div style={{ height: "100%", display: "Flex", justiftContent: "Center" }}>
            <img style={{ width: "500px", height: "400px", margin: "auto" }} alt="Innovate IT" src={process.env.PUBLIC_URL + '/logo2.svg'} />
          </div>
        </FlexBox>
        <FlexBox direction="Column" alignItems="Center" justifyContent="Center" id="login-bottom-window">
          <FlexBox direction="Column" alignItems="Center" justifyContent="Center" style={{ flex: "1 1 40%", width: "100%", fontSize: "24px" }}>
            {/* <img style={{width:"120px",height:"120px"}} alt="Innovate IT" src={process.env.PUBLIC_URL + '/login-mini-logo.png'} /> */}
            <span>Welcome to </span>
            <span style={{ fontSize: "36px", fontWeight: "700" }}>WATCH<span style={{ fontSize: "36px", fontWeight: "700", color: "orange" }}>MEN</span></span>
          </FlexBox>
          <FlexBox direction="Column" alignItems="Center" justifyContent="Center" style={{ width: "100%", padding: "20px" }}>
            <FlexBox direction="Column" alignItems="Stretch" style={{ gap: 8, width: "80%" }}>
              <Title level="H5">Service ID (Required)</Title>
              <Input
                style={{ width: "100%" }}
                id="serviceID"
                name="serviceID"
                placeholder="Enter your Service ID"
                required
                value={formData["serviceID"]}
                onChange={handleChange}
                valueState={errors["serviceID"] ? "Negative" : "None"}
                valueStateMessage={errors["serviceID"] && <Text type="Error">{errors["serviceID"]}</Text>}
              />
              {/* Divider */}
              <Title level="H6" style={{ marginTop: 16 }}>Choose a Login Method</Title>
              {/* Username/Password */}
              <Input
                style={{ width: "100%" }}
                id="username"
                type="Email"
                name="username"
                placeholder="Username"
                value={formData["username"]}
                onChange={handleChange}
                valueState={errors["username"] ? "Negative" : "None"}
                valueStateMessage={errors["username"] && <Text type="Error">{errors["username"]}</Text>}
              />
              <Input
                style={{ width: "100%" }}
                id="password"
                name="password"
                placeholder="Password"
                type={passwordType}
                icon={<Button design="Transparent" icon={passwordIcon} onClick={showPassword} />}
                value={formData["password"]}
                onChange={handleChange}
                valueState={errors["password"] ? "Negative" : "None"}
                valueStateMessage={errors["password"] && <Text type="Error">{errors["password"]}</Text>}
              />
              <Button onClick={handleLogin} disabled={loading || !formData["serviceID"]}>Sign in with Username/Password</Button>
              {/* OR Divider */}
              <FlexBox direction="Row" alignItems="Center" justifyContent="Center" style={{ margin: "10px 0" }}>
                <div style={{ flex: 1, height: 1, background: '#ccc' }}></div>
                <span style={{ margin: '0 6px', color: '#888' }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#ccc' }}></div>
              </FlexBox>
              {/* //<FlexBox direction="Column" alignItems="Center" justifyContent="Stretch" > */}
                <div style={{ width: '100%',marginBottom: 16, display:'flex', justifyContent:'center', alignItems:'center' }}>
                  <GoogleLogin
                    width="100%"
                    theme="outline"      // or "outline", "filled_black"
                    size="large"             // or "medium", "small"
                    text="signin_with"
                    onSuccess={async credentialResponse => {
                      try {
                        const credentials = {
                          token: credentialResponse.credential,
                          serviceID: serviceID,
                        };
                        const user = await login(credentials, "GOOGLE"); // Handles either JWT or SAML login based on AUTHTYPE
                        setDashboardLoading(true);
                        if (user.data.isPasswordInitial) {
                          window.location.href = "/changePassword";
                        } else {
                          window.location.href = "/dashboard";
                        }
                      } catch (err) {
                        setMessage({ open: false, toastMessage: err.message, result: null, callback: null, toast: true });
                      }
                    }}
                    onError={() => {
                      setMessage({ open: false, toastMessage: "Google login failed!", result: null, callback: null, toast: true });
                    }}
                  />
                </div>
              {/* //</FlexBox> */}
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
};

export default LoginPage;