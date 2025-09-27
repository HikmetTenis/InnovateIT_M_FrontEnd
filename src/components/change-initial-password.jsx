import React, { useState,useContext } from 'react';
import "@ui5/webcomponents-icons/dist/add.js";
import {Form, FormItem, FlexBox, Input, Label, Text,FormGroup,Button, BusyIndicator} from '@ui5/webcomponents-react';
import { useNavigate, useParams } from 'react-router-dom';
import MessageContext from "../helpers/message-context";
import '@ui5/webcomponents-react/dist/Assets'
import {changeInitialPassword} from '../services/s-account'
const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [currentPasswordIcon, setCurrentPasswordIcon] = useState('show');
    const [currentPasswordType, setCurrentPasswordType] = useState('Password');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordIcon, setConfirmPasswordIcon] = useState('show');
    const [passwordIcon, setPasswordIcon] = useState('show');
    const [confirmPasswordType, setConfirmPasswordType] = useState('Password');
    const [passwordType, setPasswordType] = useState('Password');
    const [password, setPassword] = useState('');
    const {message,setMessage} = useContext(MessageContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        confirmPassword: '',
        password:'',
        currentPassword:''
    });
    const [errors, setErrors] = useState({
        confirmPassword: '',
        password: '',
        currentPassword:''
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Validate on change
        setErrors({ ...errors, [name]: validateField(name, value) });
        if(name === "confirmPassword")
            setConfirmPassword(e.target.value)
        if(name === "password")
            setPassword(e.target.value)
        if(name === "currentPassword")
            setCurrentPassword(e.target.value)
    };
    const validateField = (name, value, message) => {
        
        switch (name) {
            case 'confirmPassword':
                if(message){
                    return message
                }
                return value ? '' : 'Confirm Password is required';
            case 'password':
                if(message){
                    return message
                }
                return value ? '' : 'Password is required';
            case 'currentPassword':
                if(message){
                    return message
                }
                return value ? '' : 'Current Password is required';
            default:
                return '';
        }
        
    };
    const showConfirmPassword = () =>{
        if(confirmPasswordIcon === "show"){
            setConfirmPasswordIcon("hide")
            setConfirmPasswordType("Text")
        }else{
            setConfirmPasswordIcon("show")
            setConfirmPasswordType("Password")
        }
    }
    const showCurrentPassword = () =>{
        if(currentPasswordIcon === "show"){
            setCurrentPasswordIcon("hide")
            setCurrentPasswordType("Text")
        }else{
            setCurrentPasswordIcon("show")
            setCurrentPasswordType("Password")
        }
    }
    const showPassword = () =>{
        if(passwordIcon === "show"){
            setPasswordIcon("hide")
            setPasswordType("Text")
        }else{
            setPasswordIcon("show")
            setPasswordType("Password")
        }
    }
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const newErrors = {};
        let isValid = true;
        for (let field in formData) {
            const error = validateField(field, formData[field]);
            newErrors[field] = error;
            if (error) isValid = false;
        }
        setErrors(newErrors);
        if(confirmPassword !== password){
            setErrors({
                confirmPassword: validateField("confirmPassword", '', 'Passwords dont match'),
                password: validateField("password", '', 'Passwords dont match')
            });
            isValid = false;
        }
        
        if (isValid) {
            setLoading(true)
            try {
                const credentials = {
                    currentPassword: currentPassword,
                    newPassword:password
                }
                const response = await changeInitialPassword( credentials );
                setLoading(false)
                window.location.href = "/dashboard";
               
            } catch (error) {
                setLoading(false)
                setMessage({open:false, toastMessage:"Change inital password failed!", result:null, callback:null, toast:true})
            }
        }
    };
    return (
        <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="M">
            <FlexBox direction="Column" alignItems="Center" justifyContent="Start" fitContainer="true">
                <Form style={{width:"100%"}}
                    headerText="Change Initial PAssword"
                    labelSpan="S12 M1 L1 XL1"
                    layout="S1 M1 L1 XL1">
                    <FormGroup headerText="">
                        <FormItem labelContent={<Label>Current Password</Label>}>
                            <Input type={currentPasswordType} style={{width:"400px"}} required icon={<Button  design="Transparent"  icon={currentPasswordIcon}  onClick={() => showCurrentPassword()}/>}
                                name="currentPassword"
                                onChange={handleChange}
                                value={formData["currentPassword"]}
                                valueState={errors["currentPassword"] ? "Negative" : "None"}
                                valueStateMessage={errors["currentPassword"] && <Text type="Error">{errors["currentPassword"]}</Text>}/>
                        </FormItem>
                        <FormItem labelContent={<Label>New Password</Label>}>
                            <Input type={passwordType} style={{width:"400px"}} required icon={<Button  design="Transparent"  icon={passwordIcon}  onClick={() => showPassword()}/>}
                                name="password"
                                onChange={handleChange}
                                value={formData["password"]}
                                valueState={errors["password"] ? "Negative" : "None"}
                                valueStateMessage={errors["password"] && <Text type="Error">{errors["password"]}</Text>}/>
                        </FormItem>
                        <FormItem labelContent={<Label>Confirm Password</Label>}>
                            <Input type={confirmPasswordType} style={{width:"400px"}} required icon={<Button  design="Transparent"  icon={confirmPasswordIcon}  onClick={() => showConfirmPassword()}/>}
                                name="confirmPassword"
                                onChange={handleChange}
                                value={formData["confirmPassword"]}
                                valueState={errors["confirmPassword"] ? "Negative" : "None"}
                                valueStateMessage={errors["confirmPassword"] && <Text type="Error">{errors["confirmPassword"]}</Text>}/>
                        </FormItem>
                    </FormGroup>
                </Form>
                <FlexBox direction="Row" alignItems="Start" justifyContent="SpaceBetween" fitContainer="true">
                    <Button style={{width:"300px", marginTop:"20px"}} design="Default" icon="arrow-left" onClick={() => navigate("/login")}>Back</Button>
                    <Button style={{width:"300px", marginTop:"20px"}} design="Emphasized" icon="reset" onClick={(e) => handleUpdatePassword(e)}>Reset</Button>
                </FlexBox>
            </FlexBox>
        </BusyIndicator>
    );
};

export default ChangePassword;