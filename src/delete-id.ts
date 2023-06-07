import { agent } from './veramo/index.js'

const main = async () => {
    const alias: string | null = process.argv[2]

    if (alias == null) throw new Error('identity alias undefined')

    const identifiers = await agent.didManagerFind({ alias })

    if (identifiers.length === 0) throw new Error(`identity with alias ${alias} not found`)

    console.log(`\n${identifiers.length} identities with alias ${alias} will be deleted\n`)

    for (let i = 0; i < identifiers.length; i++) {
        await agent.didManagerDelete({ did: identifiers[i].did })
        console.log('Identity Deleted: ', identifiers[i])
    }

    console.log(`\nAll identities with alias ${alias} have been deleted\n`)
}

main().catch(console.log)
