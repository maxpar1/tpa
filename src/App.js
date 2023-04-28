import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "./redux/data/dataActions";
import gif from './card.png';
import logo from './tokenlogo.png'

import './App.css';
import { connect } from "./redux/blockchain/blockchainActions";
function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost*mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount.toString())
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 3) {
      newMintAmount = 3;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <div className="App">

      <div className="mint-section">
        <img src={logo} className="logo_img"></img>
          <div className="sec-mint">
            <div class="container">
              <div class="row">
                <div class="col-md-12 text-center">
                  <h3 class="animate-charcter"> Welcome to the Token Prophet Pass Mint page</h3>
                </div>
              </div>
            </div>
            <h1></h1>
            <div className="gif">
              <img className="gif-img" src= {gif}></img>
            </div>
            <p className="text-header-con">
            Buy your Token Prophet Alpha pass here to get access to the discord
            </p>
            <div className="mint-button-sec">
              {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                <>
                  
                </>
              ) : (
                <>
                  {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                    <div ai={"center"} jc={"center"}> 
                        <button className="connect-button" onClick={(e)=>{
                          e.preventDefault();
                          dispatch(connect());
                          getData();
                          
                        }}
                        >
                          connect
                          {blockchain.errorMsg !== "" ? (
                              <>
                              <div
                                style={{
                                  textAlign: "center",
                                  color: "var(--accent-text)",
                                }}
                                >
                                  {blockchain.errorMsg}
                                </div>
                                </>
                            ):null}
                        </button>
                    </div>
                  ) : (
                    <>
                      <p
                      className="feedback"
                        style={{
                          textAlign: "center",
                          color: "#FAF9F6",
                        
                        }}
                      >
                        {feedback}
                      </p>
                      <div className="pluseminbut" ai={"center"} jc={"center"} fd={"row"}>
                        <button
                          style={{ lineHeight: 0.4 }}
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            decrementMintAmount();
                          }}
                          className="StyledButton"
                        >
                          -
                        </button>
                        <p className="count"r
                          style={{
                            fontFamily: 'sans-serif',
                            textAlign: "center",
                            color: "#FAF9F6",
                  
                          }}
                        >
                          {mintAmount}
                          
                        </p>
                        <button
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            incrementMintAmount();
                          }}
                          className="StyledButton"
                        >
                          +
                        </button>
                      </div>
                      <div ai={"center"} jc={"center"} fd={"row"}>
                        <button
                         className="connect-button"
                          disabled={claimingNft ? 1 : 0}
                          onClick={(e) => {
                            e.preventDefault();
                            claimNFTs();
                            getData();
                          }}
                        >
                          Mint
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
  );
}

export default App;