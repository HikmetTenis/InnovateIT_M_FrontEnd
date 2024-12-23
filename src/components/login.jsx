import React, { useState,useContext } from 'react';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import {FlexBox, Input, Label, Text,Button,Link,BusyIndicator} from '@ui5/webcomponents-react';
import MessageContext from "../helpers/message-context";
import '@ui5/webcomponents-react/dist/Assets'
import {resetPassword} from '../services/s-account'
import { useAuth } from "../helpers/authcontext";
import CustomError from '../helpers/custom-error';
const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {message,setMessage} = useContext(MessageContext);
    const [passwordIcon, setPasswordIcon] = useState('show');
    const [passwordType, setPasswordType] = useState('Password');
    const [formData, setFormData] = useState({
        username: '',
        password:''
    });
    
      // Initial state for errors
    const [errors, setErrors] = useState({
        username: '',
        password: ''
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Validate on change
        setErrors({ ...errors, [name]: validateField(name, value) });
        if(name === "username")
            setUsername(e.target.value)
        if(name === "password")
            setPassword(e.target.value)
    };
    const validateField = (name, value, message) => {
        switch (name) {
            case 'username':
                if(message){
                    return message
                }
                return value ? '' : 'User Name is required';
            case 'password':
                if(message){
                    return message
                }
                return value ? '' : 'Password is required';
            default:
                return '';
        }
    };
    const handleLogin = async (e) => {
        setLoading(true)
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
            try {
                const credentials = {
                    username:username,
                    password: password,
                    serviceID: process.env.REACT_APP_SERVICE_ID
                }
                const user = await login(credentials); // Handles either JWT or SAML login based on AUTHTYPE
                setLoading(false)
                if(user.data.isPasswordInitial){
                    window.location.href = "/changePassword";
                }else{
                    window.location.href = "/dashboard";
                }
            } catch (err) {
                setLoading(false)
                if (err instanceof CustomError) {
                    setMessage({open:false, toastMessage:err.message, result:null, callback:null, toast:true})
                } else {
                    setErrors({
                        username: validateField("username", '', 'Login failed, Username may not be correct.'),
                        password: validateField("password", '', 'Login failed, Password may not be correct.')
                    });
                    setMessage({open:false, toastMessage:"Login failed.!", result:null, callback:null, toast:true})
                }
            }
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
            setMessage({open:true, message:"Do you want to reset your password?", result:null, callback:resetPasswordAction,toastMessage:message.toastMessage})
        }
    }
    const resetPasswordAction = async () => {
        try{
            const credentials = {
                username:username,
            }
            const response = await resetPassword( credentials );
            setMessage({open:false, toastMessage:"Reset link will be sent to the associated email to the account, if you have account, if you dont receive any email, try to Register..", result:null, callback:null, toast:true})
        } catch (error) {
            setMessage({open:false, toastMessage:"Something went wrong.!", result:null, callback:null, toast:true})
        }
    };
    const showPassword = () =>{
        if(passwordIcon === "show"){
            setPasswordIcon("hide")
            setPasswordType("Text")
        }else{
            setPasswordIcon("show")
            setPasswordType("Password")
        }
    }
    return (
        <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true">
            <Text style={{top:"10px", position:"absolute", right:"50px"}}>{process.env.REACT_APP_VERSION}</Text>
            <FlexBox direction="Column" alignItems="Center" justifyContent="Center" id="login-picture-wrapper">
                <div style={{height:"100%", display:"Flex", justiftContent:"Center"}}>
                    <img style={{width:"500px",height:"400px",margin:"auto"}} alt="Innovate IT" src={process.env.PUBLIC_URL + '/logo2.svg'} />
                </div>
            </FlexBox>
            <FlexBox direction="Column" alignItems="Center" justifyContent="Center" id="login-bottom-window">
                <FlexBox direction="Column" alignItems="Center" justifyContent="Center" style={{flex:"1 1 40%",width:"100%", fontSize:"24px"}}>
                    {/* <img style={{width:"120px",height:"120px"}} alt="Innovate IT" src={process.env.PUBLIC_URL + '/login-mini-logo.png'} /> */}
                    <span>Welcome to </span>
                    <span style={{fontSize:"36px", fontWeight:"700"}}>WATCH<span style={{fontSize:"36px", fontWeight:"700", color:"orange"}}>MEN</span></span>
                </FlexBox>
                <FlexBox direction="Column" alignItems="Center" justifyContent="Center" style={{width:"100%"}}>
                    <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceAround" style={{width:"100%"}}>
                        <Label for="username">Username : </Label>
                        <Input id="username" style={{width:"60%"}} type="Email"  required 
                            name="username"
                            onChange={handleChange}
                            value={formData["username"]}
                            valueState={errors["username"] ? "Negative" : "None"}
                            valueStateMessage={errors["username"] && <Text type="Error">{errors["username"]}</Text>}/>
                    </FlexBox>
                    <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceAround" style={{width:"100%"}}>
                        <Label for="password">Password : </Label>
                        <Input id="password" style={{width:"60%"}} icon={<Button  design="Transparent"  icon={passwordIcon}  onClick={() => showPassword()}/>} type={passwordType} required 
                            name="password"
                            onChange={handleChange}
                            value={formData["password"]}
                            valueState={errors["password"] ? "Negative" : "None"}
                            valueStateMessage={errors["password"] && <Text type="Error">{errors["password"]}</Text>}/>
                    </FlexBox>
                </FlexBox> 
                <BusyIndicator active={loading} style={{marginRight:"5px",flex:"1"}} delay={1000} size="S">
                    <FlexBox direction="Column" alignItems="Center" justifyContent="Center" style={{flex:"1 1 10%",padding:"20px"}}>
                        
                            <Button style={{width:"100%"}} design="Emphasized" icon="unlocked" onClick={(e) => handleLogin(e)}>Sign In</Button>
                        
                            <FlexBox direction="Row" alignItems="Center" justifyContent="SpaceBetween" style={{width:"100%", height:"30px"}}>
                                <Link design="Default" onClick={(e) => resetPasswordDialog(e)}>Forgot Password </Link>
                            </FlexBox>
                        
                    </FlexBox>
                </BusyIndicator>
            </FlexBox>
        </FlexBox>
    );
};

export default LoginPage;