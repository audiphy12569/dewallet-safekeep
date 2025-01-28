// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DeWallet
 * @dev A secure wallet contract for managing ETH and ERC-20 tokens
 */
contract DeWallet is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

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
    mapping(address => mapping(address => uint256)) public tokenBalances; // user => token => balance
    uint256 public totalWallets;
    uint256 public constant RECOVERY_DELAY = 24 hours;

    // Events
    event WalletCreated(address indexed owner, uint256 timestamp);
    event EthTransferred(address indexed from, address indexed to, uint256 amount);
    event TokenTransferred(address indexed token, address indexed from, address indexed to, uint256 amount);
    event WalletRecoveryInitiated(address indexed wallet, uint256 timestamp);
    event WalletRecovered(address indexed oldWallet, address indexed newWallet, uint256 timestamp);
    event SeedPhraseUpdated(address indexed wallet, uint256 timestamp);

    // Modifiers
    modifier onlyActiveWallet() {
        require(wallets[msg.sender].isActive, "Wallet is not active");
        _;
    }

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        require(_address != address(this), "Cannot interact with contract address");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new wallet
     * @param _seedPhraseHash Hash of the encrypted seed phrase
     */
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

    /**
     * @dev Transfers ETH to another address
     * @param _to Recipient address
     */
    function transferETH(address _to) external payable onlyActiveWallet validAddress(_to) nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        require(address(this).balance >= msg.value, "Insufficient balance");

        (bool success, ) = _to.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        wallets[msg.sender].lastActivity = block.timestamp;
        emit EthTransferred(msg.sender, _to, msg.value);
    }

    /**
     * @dev Transfers ERC-20 tokens
     * @param _token Token contract address
     * @param _to Recipient address
     * @param _amount Amount of tokens to transfer
     */
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

    /**
     * @dev Updates wallet seed phrase
     * @param _newSeedPhraseHash New seed phrase hash
     */
    function updateSeedPhrase(bytes32 _newSeedPhraseHash) external onlyActiveWallet {
        require(_newSeedPhraseHash != bytes32(0), "Invalid seed phrase hash");
        wallets[msg.sender].seedPhraseHash = _newSeedPhraseHash;
        wallets[msg.sender].lastActivity = block.timestamp;

        emit SeedPhraseUpdated(msg.sender, block.timestamp);
    }

    /**
     * @dev Initiates wallet recovery process
     * @param _seedPhraseHash Hash of the seed phrase for verification
     */
    function initiateRecovery(bytes32 _seedPhraseHash) external {
        Wallet storage wallet = wallets[msg.sender];
        require(wallet.owner != address(0), "Wallet does not exist");
        require(wallet.seedPhraseHash == _seedPhraseHash, "Invalid seed phrase");

        emit WalletRecoveryInitiated(msg.sender, block.timestamp);
    }

    /**
     * @dev Completes wallet recovery process
     * @param _oldWallet Address of the old wallet
     * @param _signature Signed message proving ownership
     */
    function completeRecovery(
        address _oldWallet,
        bytes memory _signature
    ) external validAddress(_oldWallet) {
        Wallet storage oldWallet = wallets[_oldWallet];
        require(oldWallet.owner != address(0), "Old wallet does not exist");
        
        bytes32 messageHash = keccak256(abi.encodePacked(_oldWallet, msg.sender, block.timestamp));
        bytes32 signedHash = ECDSA.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(signedHash, _signature);
        require(signer == _oldWallet, "Invalid signature");

        // Transfer ownership
        wallets[msg.sender] = oldWallet;
        wallets[msg.sender].owner = msg.sender;
        wallets[msg.sender].lastActivity = block.timestamp;
        delete wallets[_oldWallet];

        emit WalletRecovered(_oldWallet, msg.sender, block.timestamp);
    }

    /**
     * @dev Returns wallet details
     * @param _wallet Wallet address
     */
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

    /**
     * @dev Estimates gas fee for ETH transfer
     * @param _to Recipient address
     * @param _value Amount to transfer
     */
    function estimateGasFee(address _to, uint256 _value) external view returns (uint256) {
        return gasleft();
    }

    // Receive function to accept ETH
    receive() external payable {}

    // Fallback function
    fallback() external payable {}
}