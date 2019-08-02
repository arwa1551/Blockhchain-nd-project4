const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');
const { Block, Blockchain } = require('./simpleChain');

let blockchain = new Blockchain();

const timeoutRequestsWindowTime = 5 * 60 * 1000;
const validTimeoutRequestsWindowTime = 30 * 60 * 1000;

class starValidation {
    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
        this.validTimeoutRequests = [];
    }

    addRequestValidation(address) {
        let self = this;
        if (this.mempool[address]) {
            this.mempool[address] = {
                ...this.mempool[address]
            };
            this.mempool[address].validationWindow = this.varifyTimeLeft(this.mempool[address].requestTimeStamp.toString().slice(0, -3));
            return this.mempool[address];
        }

        let now = Date.now();
        this.mempool[address] = {
            address: address,
            requestTimeStamp: now,
            message: `${address}:${now}:starRegistry`,
            validationWindow: this.varifyTimeLeft(now.toString().slice(0, -3))
        }

        this.timeoutRequests[address] = setTimeout(() => {
            delete self.mempool[address];
        }, timeoutRequestsWindowTime);
        return this.mempool[address];
    }

    varifyTimeLeft(requestTimeStamp) {
        let timeElapse = (new Date().getTime().toString().slice(0, -3)) - requestTimeStamp;
        let timeLeft = (timeoutRequestsWindowTime / 1000) - timeElapse;
        return timeLeft;
    }

    validateRequestByWallet(address, signature) {
        let self = this;
        if (this.mempoolValid[address]) {
            this.mempoolValid[address] = {
                ...this.mempoolValid[address]
            };
            this.mempoolValid[address].status.validationWindow = this.varifyTimeLeft(this.mempoolValid[address].status.requestTimeStamp.toString().slice(0, -3));
            return this.mempoolValid[address];
        }
        if (this.mempool[address]) {
            let request = this.mempool[address];
            if (bitcoinMessage.verify(request.message, address, signature)) {

                let now = Date.now();
                this.mempoolValid[address] = {
                    registerStar: true,
                    status: {
                        address: address,
                        requestTimeStamp: now,
                        message: `${address}:${now}:starRegistry`,
                        validationWindow: this.varifyTimeLeft(request.requestTimeStamp.toString().slice(0, -3)),
                        messageSignature: true
                    }
                }

                clearTimeout(this.timeoutRequests[address]);
                delete this.mempool[address];

                this.validTimeoutRequests[address] = setTimeout(() => {
                    delete self.mempoolValid[address];
                }, validTimeoutRequestsWindowTime);

                return this.mempoolValid[address];
            }
        } else {
            return false;
        }
    }

    verifyAdressRequests(address) {
        return this.mempoolValid[address];
    }

    async addBlock(address, star) {
        if (this.verifyAdressRequests(address)) {
            let storyEncoded = Buffer.from(star.story).toString('hex');
            let body = {
                address: address,
                star: {
                    ra: star.ra,
                    dec: star.dec,
                    story: storyEncoded
                }
            }
            await blockchain.addBlock(new Block(body));
            clearTimeout(this.validTimeoutRequests[address]);
            delete this.mempoolValid[address];

            const height = await blockchain.getBlockHeight()
            const block = await blockchain.getBlock(height)
            return await block;

        } else {
            return false;
        }

    }

    async getBlockHash(hash) {
        let block = await blockchain.getBlockByHash(hash);
        let story = block.body.star.story;
        block.body.star = {
            ...block.body.star,
            storyDecoded: hex2ascii(story)
        }
        return await block;
    }

    async getBlockAddress(address) {
        let blocks = [];
        let block = await blockchain.getBlockByAddress(address);// An array of blocks
        block.forEach(element => {
            let story = element.body.star.story;
            element.body.star = {
                ...element.body.star,
                storyDecoded: hex2ascii(story)
            }
            blocks.push(element);

        });
        return blocks;
    }

    async getBlockHeight(height) {
        let block = await blockchain.getBlock(height);
        let story = block.body.star.story;
        block.body.star = {
            ...block.body.star,
            storyDecoded: hex2ascii(story)
        }
        return await block;
    }

}

module.exports = starValidation;