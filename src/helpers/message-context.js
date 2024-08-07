import {createContext } from 'react';
const messageContext = createContext({
    message: "",
    setMessage: (value) => {},
});
export default messageContext;