import React, { useState,useContext,useEffect } from 'react';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import {Form, FormItem, FlexBox, Input, Label, Text,FormGroup,Button, Dialog, BusyIndicator} from '@ui5/webcomponents-react';
import { useNavigate, useParams } from 'react-router-dom';
import MessageContext from "../helpers/message-context";
import '@ui5/webcomponents-react/dist/Assets'
import {checkPasswordLink, savePassword} from '../services/s-account'
const ResetPassword = () => {
    const { userId,link } = useParams();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordIcon, setConfirmPasswordIcon] = useState('show');
    const [passwordIcon, setPasswordIcon] = useState('show');
    const [confirmPasswordType, setConfirmPasswordType] = useState('Password');
    const [passwordType, setPasswordType] = useState('Password');
    const [password, setPassword] = useState('');
    const [countdown, setCountdown] = useState(5);
    const [countdown1, setCountdown1] = useState(5);
    const {message,setMessage} = useContext(MessageContext);
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [dialogIsOpen1, setDialogIsOpen1] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        confirmPassword: '',
        password:''
    });
    let timer1 = null
    useEffect(() => {
        setLoading(true)
        const checkPasswordLinkFirst = async () => {
            try {
                await checkPasswordLink(link,userId)
                setLoading(false)
            } catch (error) {
                setLoading(false)
                const timer = setInterval(() => {
                    setCountdown(prevCountdown => prevCountdown - 1);
                }, 1000);
                return () => clearInterval(timer);
            }
        }
        checkPasswordLinkFirst()
    }, [userId,link,navigate]);
    useEffect(() => {
        if (countdown <= 0){
            setDialogIsOpen(false)
            navigate('/login');
        }
        if(countdown < 5 && countdown > 0)
            setDialogIsOpen(true)
    }, [countdown]);
    const [errors, setErrors] = useState({
        confirmPassword: '',
        password: ''
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
    };
    const validateField = (name, value, message) => {
        
        switch (name) {
            case 'confirmPassword':
                if(message){
                    return message
                }
                return value ? '' : 'ConfirmPassword is required';
            case 'password':
                if(message){
                    return message
                }
                return value ? '' : 'Password is required';
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
                    password: password,
                    link:link,
                    email:userId
                }
                const response = await savePassword( credentials );
                //setLoading(false)
                timer1 = setInterval(() => {
                    setCountdown1(prevCountdown => prevCountdown - 1);
                }, 1000);

            } catch (error) {
                setMessage({open:false, toastMessage:"Login failed.!", result:null, callback:null, toast:true})
            }
        }
    };
    useEffect(() => {
        if (countdown1 <= 0){
            clearInterval(timer1)
            setDialogIsOpen1(false)
            navigate('/login');
        }
        if(countdown1 < 5 && countdown1 > 0)
            setDialogIsOpen1(true)
    }, [countdown1]);
    return (
        <BusyIndicator active={loading} style={{width:"100%", height:"100%"}} size="M">
            <FlexBox direction="Column" alignItems="Center" justifyContent="Start" fitContainer="true">
                <Dialog id="myModal" className="headerPartNoPadding footerPartNoPadding" open={dialogIsOpen} headerText="Not good.." style={{zIndex:104}} aria-modal="true">
                    <FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true">
                        <Text>It looks like the information you have is either incorrect or invalid..</Text>
                        <Text style={{fontSize:"24px",padding:"20px"}}>Redirecting in {countdown}</Text>
                    </FlexBox>
                </Dialog>
                <Dialog id="myModal1" className="headerPartNoPadding footerPartNoPadding" open={dialogIsOpen1} headerText="Updated.." style={{zIndex:104}} aria-modal="true">
                    <FlexBox direction="Column" alignItems="Center" justifyContent="Center" fitContainer="true">
                        <Text>Your password updated succesfully..</Text>
                        <Text style={{fontSize:"24px",padding:"20px"}}>Redirecting in {countdown1}</Text>
                    </FlexBox>
                </Dialog>
                <Form style={{width:"100%"}}
                    headerText="Registration Form"
                    labelSpan="S12 M1 L1 XL1"
                    layout="S1 M1 L1 XL1">
                    <FormGroup headerText="">
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

export default ResetPassword;