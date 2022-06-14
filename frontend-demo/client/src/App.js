import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
     const { accounts, contract } = this.state;

    // // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();

    // // Update state with the result.
    // this.setState({ storageValue: response });
     this.setState({ storageValue: accounts[0] });
  };


  //
  getManager = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.manager().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  //
  getBalance = async () => {
    const { accounts, contract } = this.state;
    
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getBalance().call({from: accounts[0]});

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  //
  selectWinner = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.pickWinner().send({ from: accounts[0] });

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  //
  userGues = async () => {
   const acc = document.getElementById("showTxt").value;
    const gues = document.getElementById("showTxt").value;
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getLottery(gues).send({from: acc, value: getWeb3.utils.toWei('1', 'ether')});

    // Update state with the result.
    this.setState({ storageValue: response });
  };



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <div>The stored value is: {this.state.storageValue}</div>

        <div>
          <br></br>
          <input type="text" id="accountNo" placeholder="Account No" ></input> &nbsp;&nbsp;
          <input type="text" id="guesNo" placeholder="Gues a 4 digit No" ></input> &nbsp;&nbsp;
          <button onClick={this.userGues} >Submit</button>
          <br></br>
        </div>

        <div>
          <br></br>
          <button onClick={this.getManager} >Get Manager</button> &nbsp;&nbsp; 
          <button onClick={this.getBalance} >Get Balance</button> &nbsp;&nbsp; 
          <button onClick={this.selectWinner} >Select Winner</button> &nbsp;&nbsp;
          <br></br>
          <br></br>
          <label id="showTxt"> {this.state.storageValue} </label> &nbsp;&nbsp;    
          <br></br>      
        </div>

      </div>
    );
  }
}

export default App;
