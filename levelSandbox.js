/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';

// Declaring a class
class LevelSandbox {
  // Declaring the class constructor
  constructor() {
    this.db = level(chainDB);
  }

  addLevelDBData(key, value) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.db.put(key, value, (error) => {
        if (error) {
          console.log('Block' + key + 'submission failed', error);
          reject(error);
        }
        console.log(`Added block #${key}`)
        resolve(`Added block #${key}`)
      });
    });
  }

  // Get data from levelDB with key (Promise)
  getLevelDBData(key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.db.get(key, (err, value) => {
        if (err) {
          if (err.type == 'NotFoundError') {
            resolve(undefined);
          } else {
            console.log('Block' + key + 'get failed', err);
            reject(err);
          }
        } else {
          resolve(value);
        }
      });
    });
  }

  // Get block by hash
  async getBlockByHashfromDB(hash) {
    let self = this;
    let block = null;
    return new Promise(function (resolve, reject) {
      self.db.createReadStream()
        .on('data', function (data) {
          let starBlock = JSON.parse(data.value);
          if (starBlock.hash === hash) {
            block = starBlock;
          }
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(block);
        });
    });
  }

    // Get block by Address
  async getBlockByAddressfromDB(address) {
    let self = this;
    let block = [];
    return new Promise(function (resolve, reject) {
      self.db.createReadStream()
        .on('data', function (data) {
          let starBlock = JSON.parse(data.value);
          if (starBlock.body.address === address) {
            block.push(starBlock);
          }
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(block);
        });
    });
  }

  // Get the Block height from levelDB
  getBlockHeightFromDB() {
    return new Promise((resolve, reject) => {
      let height = -1
      this.db.createReadStream().on('data', (data) => {
        height++
      }).on('error', (error) => {
        reject(error)
      }).on('close', () => {
        resolve(height)
      })
    })
  }
}
// Export the class
module.exports.LevelSandbox = LevelSandbox;
