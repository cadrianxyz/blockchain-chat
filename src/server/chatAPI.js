import express from 'express';
import Messenger from '../services/chat.js';
import keyStorage from '../services/keyStorage.js';

const router = express.Router();
const allMessengers = [];
const allMessages = {};

const getMessenger = (address) => allMessengers.find(x => x.address == address);

const addMessage = (msg, address, youSent) => {
    const message = {msg: msg, time: Date.now(), youSent: youSent};
    if (allMessages[address])
        allMessages[address].push(message);
    else
        allMessages[address] = [message];
};

async function stringifySecrets()
{
    let exportedMessengers = [];
    let data = [];
    for (let i = 0; i < allMessengers.length; i++)
        exportedMessengers.push(await allMessengers[i].export());
    for (const address in allMessages)
        for (let i = 0; i < allMessages[address].length; i++)
        {
            const msg = JSON.parse(JSON.stringify(allMessages[address][i]));
            msg['address'] = address;
            data.push(JSON.stringify(msg));
        }
    return JSON.stringify({messengers: exportedMessengers, messages: data});
}

async function rebuildSecrets(data)
{
    const exportedMessengers = data.messengers;
    const messages = data.messages;
    for (let i = 0; i < exportedMessengers.length; i++)
        allMessengers.push(await Messenger.import(JSON.parse(exportedMessengers[i])));
    for (let i = 0; i < messages.length; i++)
    {
        const msg = JSON.parse(messages[i]);
        if (allMessages[msg.address])
            allMessages[msg.address].push({msg: msg.msg, time: msg.time, youSent: msg.youSent});
        else
            allMessages[msg.address] = [({msg: msg.msg, time: msg.time, youSent: msg.youSent})];
    }
}

router
    /**
     * Create Messenger to talk to new person; Each person should only have one messenger
     * @param {string} address Address to create Messenger for
     */
    .post('/createChat/:address', async (req, res) => {
        const messenger = new Messenger(req.params.address);
        await messenger.generateDH();
        allMessengers.push(messenger);
        return res.sendStatus(200);
    })

    /**
     * Get public key from Messenger with given address
     * @param {string} address Address of person to send key to
     */
    .get('/getPublicKey/:address', async (req, res) => {
        const messenger = getMessenger(req.params.address);
        if (messenger)
        {
            const key = await messenger.getDHPublicKey();
            return res.status(200).json({success: true, key: key});
        } else 
            return res.status(400).json({success: false});
    })

    /**
     * Generate root key given public key
     * @bodyParam {string} key Public DH key
     * @bodyParam {string} address Address of user
     */
    .put('/genRootKey', async (req, res) => {
        const messenger = getMessenger(req.body.address);
        if (messenger)
        {
            await messenger.generateRootKey(req.body.key);
            await messenger.generateDH();
            return res.sendStatus(200);
        } else
            return res.sendStatus(400);
    })

    /**
     * Generate DH key
     * Should be called after generating root key
     * @bodyParam {string} key Public DH key
     * @bodyParam {string} address Address of user
     */
    .put('/receivePublicKey', async (req, res) => {
        const messenger = getMessenger(req.body.address);
        if (messenger)
        {
            await messenger.receivePublicKey(req.body.key);
            return res.sendStatus(200);
        } else
            return res.sendStatus(400);
    })

    /**
     * Encrypt message to send to address
     * @bodyParam {string} address Address of user
     * @bodyParam {string} message Plaintext to encrypt
     * @return {{header, cipherText, hashHeader}} Encrypted Message
     */
    .post('/encryptMessage', async (req, res) => {
        const m = getMessenger(req.body.address);
        if (m)
        {
            const {header, cipherText, hashHeader} = await m.ratchetEncrypt(req.body.message);
            addMessage(req.body.message, req.body.address, true);
            return res.status(200).json({success: true, header: header, ciphertext: cipherText, hashHeader: hashHeader});
        } else
            return res.status(400).json({success: false});
    })

    /**
     * Decrypt message sent by person
     * @bodyParam {string} address Address of user
     * @bodyParam {object} header Message header
     * @bodyParam {string} cipherText
     * @bodyParam {string} hashHeader
     * @return {{success, plainText}} Encrypted Message
     */
    .post('/decryptMessage', async (req, res) =>{
        const m = getMessenger(req.body.address);
        if (m)
        {
            const plainText = await m.ratchetDecrypt(req.body.header, req.body.ciphertext, req.body.hashHeader);
            addMessage(plainText, req.body.address, false);
            return res.status(200).json({success: true, plainText: plainText});
        } else
            return res.status(400).json({success: false});
        
    })

    /**
     * Create password to use to encrypt secrets
     * @bodyParam {string} password
     */
    .post('/createPassword', async (req, res) => {
        await keyStorage.createPassword(req.body.password);
        return res.sendStatus(200);
    })

    /**
     * Check if given password is correct
     * Will also try and load encrypted files if they exist
     * @bodyParam {string} password
     */
    .post('/checkPassword', async (req, res) => {
        const check = await keyStorage.checkPassword(req.body.password);
        if (check)
        {
            try 
            {
                const data = JSON.parse(await keyStorage.decryptFiles());
                await rebuildSecrets(data);
            } catch (err) {}
            return res.sendStatus(200);
        } else
            return res.sendStatus(403);
    })

    /**
     * Check if password was previously set
     */
    .post('/passwordPreviouslySet', async (req, res) => {
        const check = await keyStorage.checkPasswordFileExists();
        if (check) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(403);
        }
    })

    /**
     * Save all current messages and messenger objects
     */
    .put('/saveSession', async (req, res) => {
        const toEncrypt = await stringifySecrets();
        await keyStorage.encryptFiles(toEncrypt);
        return res.sendStatus(200);
    })

    /**
     * Get all messages from address
     * @param address Address to get
     * @return {Array} Contains objects of {msg: message sent/received, time: epoch time, youSent: if YOU sent the message}
     */
    .get('/messages/:address', async (req, res) => {
        if (allMessages[req.params.address])
            return res.status(200).send(allMessages[req.params.address]);
        else
            return res.sendStatus(400);
    })

    .get('/chatAddress', async (req, res) => {
        return res.status(200).send(Object.keys(allMessages));
    })

export default router;