// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PayLink {
    struct Link {
        address creator;
        uint256 amount;
        bool claimed;
        bytes32 passkeyHash; // keccak256 of the 16-digit passkey
    }

    mapping(bytes32 => Link) public links;

    event PayLinkCreated(bytes32 code, uint256 amount);
    event PayLinkClaimed(bytes32 code, address claimant);

    function createPayLink(bytes32 code, bytes32 _passkeyHash) external payable {
        require(msg.value > 0, "Must send SHM");
        require(links[code].amount == 0, "Code already used");
        require(_passkeyHash != bytes32(0), "Passkey hash required");
        links[code] = Link(msg.sender, msg.value, false, _passkeyHash);
        emit PayLinkCreated(code, msg.value);
    }

    function claim(bytes32 code, string calldata passkey) external {
        Link storage link = links[code];
        require(link.amount > 0 && !link.claimed, "Invalid or claimed");
        require(
            keccak256(abi.encodePacked(passkey)) == link.passkeyHash,
            "Invalid passkey"
        );
        link.claimed = true;
        payable(msg.sender).transfer(link.amount);
        emit PayLinkClaimed(code, msg.sender);
    }
}
