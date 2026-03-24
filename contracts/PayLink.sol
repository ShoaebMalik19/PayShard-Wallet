// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract PayLink {
    struct Link { address creator; uint256 amount; bool claimed; }
    mapping(bytes32 => Link) public links;

    event PayLinkCreated(bytes32 code, uint256 amount);
    event PayLinkClaimed(bytes32 code, address claimant);

    function createPayLink(bytes32 code) external payable {
        require(msg.value > 0, "Must send SHM");
        require(links[code].amount == 0, "Code already used");
        links[code] = Link(msg.sender, msg.value, false);
        emit PayLinkCreated(code, msg.value);
    }

    function claim(bytes32 code) external {
        Link storage link = links[code];
        require(link.amount > 0 && !link.claimed, "Invalid or claimed");
        link.claimed = true;
        payable(msg.sender).transfer(link.amount);
        emit PayLinkClaimed(code, msg.sender);
    }
}
