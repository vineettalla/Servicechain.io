import web3 from "./web3";
// const web3 = require('./web3');
import Service from './build/Service.json';
// const Service = require('./build/Service.json')
//this file is used to connect to a specific service at a given address and allow for use of the contract
export default (address)=>{
    return new web3.eth.Contract(Service.abi,address);
}