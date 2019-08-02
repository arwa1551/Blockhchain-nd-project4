/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    // Creating the levelSandbox class object
    this.db = new LevelSandboxClass.LevelSandbox();
    //Persist the Genesis BLock as the first block in the blockchain.
    this.getBlockHeight().then((height) => {
      if (height === -1) {
        console.log('Genesis block creation');
        this.addBlock(new Block("First block in the chain"));
      }
    })
  }

  // Add new block
  async addBlock(newBlock) {
    // Block height
    const height = parseInt(await this.getBlockHeight());
    newBlock.height = height + 1;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);

    // previous block hash
    if (newBlock.height > 0) {
      const previousBlock = await this.getBlock(height);
      newBlock.previousBlockHash = previousBlock.hash;
      console.log(`Previous hash: ${newBlock.previousBlockHash}`)
    }

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    console.log(`New hash: ${newBlock.hash}`)

    //adding block to levelDB
    await this.db.addLevelDBData(newBlock.height, JSON.stringify(newBlock));

  }

  // Get block height
  async getBlockHeight() {
    return await this.db.getBlockHeightFromDB()

  }

  // get block
  async getBlock(blockHeight) {
    return JSON.parse(await this.db.getLevelDBData(blockHeight));
  }

  // Get block by hash
  async getBlockByHash(hash) {
    return await this.db.getBlockByHashfromDB(hash);
  }

  // Get block by Wallet adress
  async getBlockByAddress(address) {
    return await this.db.getBlockByAddressfromDB(address);
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain() {
    let errorLog = [];
    const blockHeight = await this.getBlockHeight();
    for (var i = 0; i < blockHeight; i++) {
      // validate block
      if (!this.validateBlock(i)) errorLog.push(i);
      // compare blocks hash link
      let block = this.getBlock(i);
      let blockHash = block.hash;
      let nextBlock = this.getBlock(i + 1);
      let previousHash = nextBlock.previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
    } else {
      console.log('No errors detected');
    }
  }
}
module.exports = {
  Block: Block,
  Blockchain: Blockchain,
}
