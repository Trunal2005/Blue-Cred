// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BlueCred is ERC1155, AccessControl {
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant FIELD_WORKER_ROLE = keccak256("FIELD_WORKER_ROLE");
    
    uint256 public nextProjectId = 1;
    
    struct CarbonProject {
        string projectName;
        string location;
        uint256 creditsIssued;
        bool isActive;
        address submittedBy;
    }
    
    mapping(uint256 => CarbonProject) public projects;
    
    event CreditsMinted(uint256 projectId, address to, uint256 amount);
    event ProjectSubmitted(uint256 projectId, string name, address by);
    
    constructor() ERC1155("https://bluecred.io/api/token/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(FIELD_WORKER_ROLE, msg.sender);
    }
    
    function submitProject(string memory _name, string memory _location) 
        public onlyRole(FIELD_WORKER_ROLE) returns (uint256) {
        uint256 projectId = nextProjectId++;
        projects[projectId] = CarbonProject({
            projectName: _name,
            location: _location,
            creditsIssued: 0,
            isActive: true,
            submittedBy: msg.sender
        });
        emit ProjectSubmitted(projectId, _name, msg.sender);
        return projectId;
    }
    
    function mintCredits(uint256 _projectId, address _to, uint256 _amount)
        public onlyRole(VERIFIER_ROLE) {
        require(projects[_projectId].isActive, "Project not active");
        projects[_projectId].creditsIssued += _amount;
        _mint(_to, _projectId, _amount, "");
        emit CreditsMinted(_projectId, _to, _amount);
    }
    
    function freezeProject(uint256 _projectId) 
        public onlyRole(DEFAULT_ADMIN_ROLE) {
        projects[_projectId].isActive = false;
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}