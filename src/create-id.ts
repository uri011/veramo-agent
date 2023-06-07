import { agent, provider } from './veramo/index.js'

const main = async () => {
    const alias: string | null = process.argv[2]

    if (alias == null) throw new Error('identity alias undefined')

    const identity = await agent.didManagerCreate({
        alias,
        provider,
        kms: 'local',
    })

    console.log(`\nNew identity created with alias ${alias}`)
    console.log(identity)
}

main().catch(console.log)
