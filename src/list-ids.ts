import keccak256 from 'keccak256'

import { Address, createPublicClient, http } from 'viem'

import dotenv from 'dotenv'

import { agent, baseRpcUrl, network } from './veramo/index.js'

dotenv.config()

if (process.env.INFURA_API_KEY == null) throw new Error('undefined infura secret key')

const main = async () => {
    const client = createPublicClient({
        transport: http(`${baseRpcUrl}${process.env.INFURA_API_KEY}`),
    })

    const identifiers = await agent.didManagerFind()

    console.log(`\nThere are ${identifiers.length} identifiers\n`)

    if (identifiers.length > 0) {
        for (let i = 0; i < identifiers.length; i++) {
            if (identifiers[i].controllerKeyId == null)
                throw new Error('no controller secp256k1 raw public key found')

            // Derive address from raw public key
            const rawPubKey = identifiers[i].controllerKeyId
            const hashPubKey = keccak256(rawPubKey)
            let address = hashPubKey.subarray(-20).toString('hex').toLowerCase()

            // Calculate checksum (expressed as upper/lower case in the address)
            const addressHash = keccak256(address).toString('hex')
            let addressChecksum = ''
            for (let k = 0; k < address.length; k++) {
                if (parseInt(addressHash[k], 16) > 7) {
                    addressChecksum += address[k].toUpperCase()
                } else {
                    addressChecksum += address[k]
                }
            }

            address = `0x${address}`
            addressChecksum = `0x${addressChecksum}`

            const balance = await client.getBalance({ address: address as Address })

            console.log(`\n---------------------\n`)
            console.log(`${i + 1} - Indentifier Alias: ${identifiers[i].alias}\n`)
            console.log(`DID Controller EVM Public Address: ${address}`)
            console.log(`DID Controller EVM Public Checksum Address: ${addressChecksum}`)
            console.log(`DID Controller EVM Public Address Balance: ${balance} Wei`)
            console.log(`DID Controller EVM Public Address Network: ${network}\n`)
            console.log(identifiers[i])
            console.log(`\n---------------------\n`)
        }
    }
}

main().catch(console.log)
