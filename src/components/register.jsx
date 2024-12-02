import React, { useState,useEffect,useRef,useContext } from 'react';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Form, FormItem, FlexBox, Input, Label, Text,FormGroup,Button, Select, Option} from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import {createAccount} from '../services/s-account'
import MessageContext from "../helpers/message-context";
import '@ui5/webcomponents-react/dist/Assets'
const Register = () => {
    const [countries, setCountries] = useState([]);
    const {message,setMessage} = useContext(MessageContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        companyCity: '',
        companyAddress: '',
        companyZip: '',
        companyCountry: 'Select Country',
        companyName: ''
    });
    
      // Initial state for errors
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        companyCity: '',
        companyAddress: '',
        companyZip: '',
        companyCountry: '',
        companyName: ''
    });
    const email = useRef(null)
    const username = useRef(null)
    const companyName = useRef(null)
    const companyAddress = useRef(null)
    const companyCity = useRef(null)
    const companyCountry = useRef(null)
    const companyZip = useRef(null)
    const companySize = useRef(null)
    const navigate = useNavigate();
    const validateField = (name, value) => {
        switch (name) {
            // case 'password':
            //     if(value && value.length < 8)
            //         return 'Password must be at least 8 characters long';
            //     else if (!value)
            //         return 'Name is required';
            //     else
            //         return ''
            case 'username':
                return value ? '' : 'User Name is required';
            case 'email':
                return value && /^\S+@\S+\.\S+$/.test(value) ? '' : 'Invalid email';
            case 'companyName':
                return value ? '' : 'Company Name is required';
            case 'companyAddress':
                return value ? '' : 'Company Address is required';
            case 'companyZip':
                return value ? '' : 'Company Postal Code is required';
            case 'companySize':
                return value ? '' : 'Company Size is required';
            case 'companyCountry':
                return value !== 'Select Country'? '' : 'Company Country is required';
            case 'companyCity':
                return value ? '' : 'Company City is required';
            default:
                return '';
        }
    };
    useEffect(() => {
        fetch(process.env.PUBLIC_URL +'/countries.txt')
          .then(response => response.text())
          .then(data => {
            const countryArray = data.split('\n').map(country => country.trim()).filter(Boolean);
            setCountries(countryArray);
          })
          .catch(error => console.error("Error fetching countries:", error));
    }, []);
    const generateAlphanumericID = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 20; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Validate on change
        setErrors({ ...errors, [name]: validateField(name, value) });
    };
    const register = async (e) => {
        e.preventDefault();
        const newErrors = {};
        let isValid = true;
        for (let field in formData) {
            const error = validateField(field, formData[field]);
            newErrors[field] = error;
            if (error) isValid = false;
        }
        setErrors(newErrors);
        const data = {
            id:generateAlphanumericID(),
            email: email.current.value,
            username: username.current.value,
            companyName: companyName.current.value,
            companyAddress: companyAddress.current.value,
            companyCity: companyCity.current.value,
            companyCountry: companyCountry.current.selectedOption.value,
            companyZip: companyZip.current.value,
            companySize: companySize.current.selectedOption.value,
        }
        if (isValid) {
            const resp = await createAccount(data, "REGISTER")
            if(resp.type === "success"){
                setMessage({open:false, toastMessage:"Account has been created, you will receive Welcome Email with your credentials shortly.!", result:null, callback:null, toast:true})
            }else{
                setMessage({open:false, toastMessage:resp.obj, result:null, callback:null, toast:true})
            }
        }

    }
    return (
        <FlexBox direction="Column" alignItems="Center" justifyContent="Start" fitContainer="true">
            <Form style={{width:"100%"}}
                headerText="Registration Form"
                labelSpan="S12 M1 L1 XL1"
                layout="S1 M1 L1 XL1">
                <FormGroup headerText="Personal Data">
                    <FormItem labelContent={<Label>Username (Email)</Label>}>
                        <Input ref={email} type="Text" style={{width:"500px"}} required 
                            name="email"
                            onChange={handleChange}
                            value={formData["email"]}
                            valueState={errors["email"] ? "Negative" : "None"}
                            valueStateMessage={errors["email"] && <Text type="Error">{errors["email"]}</Text>}/>
                    </FormItem>
                    <FormItem labelContent={<Label>Name</Label>}>
                        <Input ref={username} type="Text" style={{width:"600px"}} required
                            name="username"
                            onChange={handleChange}
                            value={formData["username"]}
                            valueState={errors["username"] ? "Negative" : "None"}
                            valueStateMessage={errors["username"] && <Text type="Error">{errors["username"]}</Text>}/>
                    </FormItem>
                </FormGroup>
                <FormGroup headerText="Company Data">
                    <FormItem labelContent={<Label>Name</Label>}>
                        <Input ref={companyName} type="Text" style={{width:"400px"}} required
                            name="companyName"
                            onChange={handleChange}
                            value={formData["companyName"]}
                            valueState={errors["companyName"] ? "Negative" : "None"}
                            valueStateMessage={errors["companyName"] && <Text type="Error">{errors["companyName"]}</Text>}/>
                    </FormItem>
                    <FormItem labelContent={<Label>Address</Label>}>
                        <Input ref={companyAddress} type="Text" style={{width:"600px"}} required
                            name="companyAddress"
                            onChange={handleChange}
                            value={formData["companyAddress"]}
                            valueState={errors["companyAddress"] ? "Negative" : "None"}
                            valueStateMessage={errors["companyAddress"] && <Text type="Error">{errors["companyAddress"]}</Text>}/>
                    </FormItem>
                    <FormItem labelContent={<Label>City</Label>}>
                        <Input ref={companyCity} type="Text" style={{width:"200px"}} required
                            name="companyCity"
                            onChange={handleChange}
                            value={formData["companyCity"]}
                            valueState={errors["companyCity"] ? "Negative" : "None"}
                            valueStateMessage={errors["companyCity"] && <Text type="Error">{errors["companyCity"]}</Text>}/>
                    </FormItem>
                    <FormItem labelContent={<Label>Country</Label>}>
                        <Select ref={companyCountry} required style={{width:"200px"}} name="companyCountry"
                            onChange={handleChange}
                            value={formData["companyCountry"]}
                            valueState={errors["companyCountry"] ? "Negative" : "None"}
                            valueStateMessage={errors["companyCountry"] && <Text type="Error">{errors["companyCountry"]}</Text>}>
                            {countries.map((country, index) => (
                                <Option key={index} value={country} data-id={index}>
                                    {country}
                                </Option>
                            ))}
                        </Select>
                    </FormItem>
                    <FormItem labelContent={<Label>Postal Code</Label>}>
                        <Input ref={companyZip} type="Text" style={{width:"200px"}} required
                            name="companyZip"
                            onChange={handleChange}
                            value={formData["companyZip"]}
                            valueState={errors["companyZip"] ? "Negative" : "None"}
                            valueStateMessage={errors["companyZip"] && <Text type="Error">{errors["companyZip"]}</Text>}/>
                    </FormItem>
                    <FormItem labelContent={<Label>Number of Employees</Label>}>
                        <Select ref={companySize} required style={{width:"200px"}} onChange={function ks(){}}  onClose={function ks(){}}  onLiveChange={function ks(){}}  onOpen={function ks(){}}  valueState="None">
                            <Option key={0} value="1-100">1-100</Option>
                            <Option key={1} value="100-500">100-500</Option>
                            <Option key={2} value="500-1000">500-1000</Option>
                            <Option key={3} value="1000-5000">1000-5000</Option>
                            <Option key={4} value="5000-10000">5000-10000</Option>
                            <Option key={5} value="10000-more">10000-more</Option>
                        </Select>
                    </FormItem>
                </FormGroup>
            </Form>
            <FlexBox direction="Row" alignItems="Start" justifyContent="SpaceBetween" fitContainer="true">
                <Button style={{width:"300px", marginTop:"20px"}} design="Default" icon="arrow-left" onClick={() => navigate("/login")}>Back</Button>
                <Button style={{width:"300px", marginTop:"20px"}} design="Emphasized" icon="customer" onClick={(e) => register(e)}>Register</Button>
            </FlexBox>
        </FlexBox>
    )
}
export default Register;