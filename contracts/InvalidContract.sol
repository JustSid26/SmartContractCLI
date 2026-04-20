// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvalidContract {
    mapping(address => uint256) public balances;

    // Vulnerability 1: Reentrancy vulnerability (CEI pattern not followed)
    // Vulnerability 2: tx.origin used for authorization
    function withdrawAll() public {
        require(tx.origin == msg.sender, "No smart contracts allowed");
        
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        // External call occurs before state update (allows reentrancy)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // State updated after the external call
        balances[msg.sender] = 0;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // Syntax error: missing semicolon
    function faultyFunction() public view returns (uint256) {
        uint256 invalid = 123
        return invalid;
    }
}
