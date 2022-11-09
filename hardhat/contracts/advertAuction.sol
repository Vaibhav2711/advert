//SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.0;

contract advertAuction{
    uint256 public currentBid;
    address public creator;
    address public currentAdvertiser;
    address[] public bidders;
    
    constructor(){
        currentBid =0;
        creator = msg.sender;
        currentAdvertiser = msg.sender;
    }

    function submitBid() public payable {
        require(msg.value > currentBid);
        currentBid = msg.value;
        currentAdvertiser = msg.sender;
        bidders.push(msg.sender);
    }

    function withdraw() public{
        require(msg.sender == creator);
        payable(creator).transfer(address(this).balance);
    }
}