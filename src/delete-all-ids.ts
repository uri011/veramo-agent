import { agent } from './veramo/index.js'

const main = async () => {
    const identifiers = await agent.didManagerFind({})

    console.log(`\n${identifiers.length} identities will be deleted\n`)

    for (let i = 0; i < identifiers.length; i++) {
        await agent.didManagerDelete({ did: identifiers[i].did })
        console.log('Identity Deleted: ', identifiers[i])
    }

    console.log(`\nAll identities have been deleted\n`)
}

main().catch(console.log)
