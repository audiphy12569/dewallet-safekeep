// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract DeWallet is ReentrancyGuard, Ownable {
    // Structs
    struct Wallet {
        address owner;
        bytes32 seedPhraseHash;
        bool isActive;
        uint256 createdAt;
        uint256 lastActivity;
    }

    // State variables
    mapping(address => Wallet) public wallets;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    uint256 public totalWallets;
    uint256 public constant RECOVERY_DELAY = 24 hours;

    // Events
    event WalletCreated(address indexed owner, uint256 timestamp);
    event EthTransferred(address indexed from, address indexed to, uint256 amount);
    event TokenTransferred(address indexed token, address indexed from, address indexed to, uint256 amount);
    event WalletRecoveryInitiated(address indexed wallet, uint256 timestamp);
    event WalletRecovered(address indexed oldWallet, address indexed newWallet, uint256 timestamp);
    event SeedPhraseUpdated(address indexed wallet, uint256 timestamp);

    modifier onlyActiveWallet() {
        require(wallets[msg.sender].isActive, "Wallet is not active");
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        require(_address != address(this), "Cannot interact with contract address");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function createWallet(bytes32 _seedPhraseHash) external {
        require(wallets[msg.sender].owner == address(0), "Wallet already exists");
        require(_seedPhraseHash != bytes32(0), "Invalid seed phrase hash");

        Wallet memory newWallet = Wallet({
            owner: msg.sender,
            seedPhraseHash: _seedPhraseHash,
            isActive: true,
            createdAt: block.timestamp,
            lastActivity: block.timestamp
        });

        wallets[msg.sender] = newWallet;
        totalWallets++;

        emit WalletCreated(msg.sender, block.timestamp);
    }

    function transferETH(address _to) external payable onlyActiveWallet validAddress(_to) nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        require(address(this).balance >= msg.value, "Insufficient balance");

        (bool success, ) = _to.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        wallets[msg.sender].lastActivity = block.timestamp;
        emit EthTransferred(msg.sender, _to, msg.value);
    }

    function transferToken(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyActiveWallet validAddress(_to) nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        IERC20 token = IERC20(_token);
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");

        require(token.transfer(_to, _amount), "Token transfer failed");
        tokenBalances[msg.sender][_token] -= _amount;

        wallets[msg.sender].lastActivity = block.timestamp;
        emit TokenTransferred(_token, msg.sender, _to, _amount);
    }

    function updateSeedPhrase(bytes32 _newSeedPhraseHash) external onlyActiveWallet {
        require(_newSeedPhraseHash != bytes32(0), "Invalid seed phrase hash");
        wallets[msg.sender].seedPhraseHash = _newSeedPhraseHash;
        wallets[msg.sender].lastActivity = block.timestamp;

        emit SeedPhraseUpdated(msg.sender, block.timestamp);
    }

    function initiateRecovery(bytes32 _seedPhraseHash) external {
        Wallet storage wallet = wallets[msg.sender];
        require(wallet.owner != address(0), "Wallet does not exist");
        require(wallet.seedPhraseHash == _seedPhraseHash, "Invalid seed phrase");

        emit WalletRecoveryInitiated(msg.sender, block.timestamp);
    }

    function completeRecovery(
        address _oldWallet,
        bytes memory _signature
    ) external validAddress(_oldWallet) {
        Wallet storage oldWallet = wallets[_oldWallet];
        require(oldWallet.owner != address(0), "Old wallet does not exist");
        
        bytes32 messageHash = keccak256(abi.encodePacked(_oldWallet, msg.sender, block.timestamp));
        
        require(
            SignatureChecker.isValidSignatureNow(
                _oldWallet,
                messageHash,
                _signature
            ),
            "Invalid signature"
        );

        // Transfer ownership
        wallets[msg.sender] = oldWallet;
        wallets[msg.sender].owner = msg.sender;
        wallets[msg.sender].lastActivity = block.timestamp;
        delete wallets[_oldWallet];

        emit WalletRecovered(_oldWallet, msg.sender, block.timestamp);
    }

    function getWalletDetails(address _wallet) external view returns (
        address owner,
        bool isActive,
        uint256 createdAt,
        uint256 lastActivity
    ) {
        Wallet memory wallet = wallets[_wallet];
        return (
            wallet.owner,
            wallet.isActive,
            wallet.createdAt,
            wallet.lastActivity
        );
    }

    function estimateGasFee(address _to, uint256 _value) external view returns (uint256) {
        return gasleft();
    }

    receive() external payable {}

    fallback() external payable {}
}