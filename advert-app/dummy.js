import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {providers,Contract,utils,BigNumber} from "ethers";
import {ABI,ADVERT_ADDRESS} from "../constants";

export default function Home() {
  //console.log(ADVERT_ADDRESS);
  const zero = BigNumber.from("0");
  const [image,setImage] = useState("./minions.png");
  const [currentBid,setCurrentBid] = useState(zero);
  const [bid,setBid] = useState("0");
  const [advertText,setAdvertText] = useState("Demo Text");
  const [connecting,setConnecting] = useState(false);
  const [showResult,setShowResult] = useState(false);
  const [walletConnected,setWalletConnected] = useState(false);
  const [disable,setDisable] = useState(true);
  const [status,setStatus] = useState("no");
  const web3ModalRef = useRef();
  let temp;

  const getProviderOrSigner = async (needSigner = false) =>{
    const provider = await web3ModalRef.current.connect();
    console.log(provider);
    const web3provider = new providers.Web3Provider(provider);
    const {chainId} = await web3provider.getNetwork();
    if(chainId != 5){
      window.alert("Change the network to Goerli");
      throw new Error("Change the network to Goerli");
    }
    if(needSigner){
      const signer = web3provider.getSigner();
      return signer;
    }
    return web3provider;
  };

  const getCurrentBid = async() => {
    const provider = await getProviderOrSigner();
    console.log("39");
    const advert = new Contract(ADVERT_ADDRESS,ABI,provider);
    console.log("41");
    const _currentBid = await advert.currentBid();
    console.log("43");
    setCurrentBid(_currentBid.toString());
  };

  const connectWallet = async () => {
    try{
      console.log("46");
      await getProviderOrSigner();
      console.log("48");
      setWalletConnected(true);
      console.log("50");
      getCurrentBid();
      //conosle.log("52");
    }catch(err){
      console.error(err);
    }
  };

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network:"goerli",
        providerOptions:{},
        disableInjectedProvider:false,
      });
      connectWallet().then(() =>{
        getCurrentBid();
      });
    }
  }, [walletConnected]);

  

  const renderButton = () =>{
    if(walletConnected){
      return(
        <span className = {styles.subtitle}>Connected</span>
      );
    }else{
      return(<button className = {styles.button} onClick = {connectWallet}>Connect</button>)
      
    }
  };

  const renderUpload = () => {
    return(
      <div className = {styles.upload}>
            <div className = {styles.subtitle}>Upload Image</div>
            <div className = {styles.subtitle} >Advertisement Text</div>
            <input
              className = {styles.input}
              type = "text"
              placeholder = "Enter Advertisement Text"
              value = {temp}
              onChange = {(e)=> temp = e.target.value}
            />
            <br />
            <input
              type = "file"
              className = {styles.input}
              type="file"
              name="myImage"
              onChange = { (event) =>{
              //console.log(event.target.files[0].name);
                setImage(URL.createObjectURL(event.target.files[0]));
                setAdvertText(temp);
              //console.log(setSelectedImage);
              //console.log(URL.createObjectURL(event.target.files[0]));
              //parentCallBack(URL.createObjectURL(event.target.files[0]));
              }}
              />
          </div>
    );
  };

  const submitBid = async() => {

    console.log("a");
    const signer = await getProviderOrSigner(true);
    const advert = new Contract(ADVERT_ADDRESS,ABI,signer);
    const tx = await advert.submitBid({value: utils.parseUnits(bid)})
    await tx.wait();
    setDisable(false);
    //console.log(bid);
    await getCurrentBid();
    setShowResult(true);
  };

  return (
    <div className = {styles.container}>
      <div className = {styles.navbar}>
        <span className = {styles.title}>Advertisement Auction</span>
        {renderButton()}
      </div>
      <div className = {styles.main}>
        <div className = {styles.left}>
          <img
            src = {image}
            className = {styles.image}
            bordered = "true"
          />
          <div className = {styles.subtitle}>{advertText}</div>
        </div>
        <div>
          <h2 className = {styles.subtitle}>Current Bid : {(utils.formatEther(currentBid)).toString()}</h2>
          <div className = {styles.subtitle}>Bid</div>
          <input 
            className = {styles.input}
            type = "text"
            placeholder = "Enter Bid"
            value = {bid}
            onChange = {(event) => setBid(event.target.value)}
          />
          <button className = {styles.button} onClick = {submitBid}>Submit Bid</button>
          {showResult ? renderUpload(): null}
        </div>
      </div>
    </div>
  )
}
