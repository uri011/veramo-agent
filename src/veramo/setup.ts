import {
    createAgent,
    type IDIDManager,
    type IResolver,
    type IDataStore,
    type IKeyManager,
} from '@veramo/core'

import { DIDManager } from '@veramo/did-manager'

import { EthrDIDProvider } from '@veramo/did-provider-ethr'

import { WebDIDProvider } from '@veramo/did-provider-web'

import { KeyManager } from '@veramo/key-manager'

import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

import {
    Entities,
    KeyStore,
    DIDStore,
    type IDataStoreORM,
    PrivateKeyStore,
    migrations,
} from '@veramo/data-store'

import { createConnection } from 'typeorm'

import dotenv from 'dotenv'

import { baseRpcUrl, network, provider } from './config.js'

dotenv.config()

if (process.env.INFURA_API_KEY == null) throw new Error('undefined infura secret key')
if (process.env.KMS_SECRET_KEY == null) throw new Error('undefined kms secret key')

const infuraApiKey = process.env.INFURA_API_KEY
const kmsSecretKey = process.env.KMS_SECRET_KEY

const DATABASE_FILE = 'database.sqlite'

const dbConnection = createConnection({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
})

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver>(
    {
        plugins: [
            new KeyManager({
                store: new KeyStore(dbConnection),
                kms: {
                    local: new KeyManagementSystem(
                        new PrivateKeyStore(dbConnection, new SecretBox(kmsSecretKey)),
                    ),
                },
            }),
            new DIDManager({
                store: new DIDStore(dbConnection),
                defaultProvider: provider,
                providers: {
                    provider: new EthrDIDProvider({
                        defaultKms: 'local',
                        network: network,
                        rpcUrl: `${baseRpcUrl}${infuraApiKey}`,
                    }),
                    'did:web': new WebDIDProvider({
                        defaultKms: 'local',
                    }),
                },
            }),
            new DIDResolverPlugin({
                resolver: new Resolver({
                    ...ethrDidResolver({ infuraProjectId: infuraApiKey }),
                    ...webDidResolver(),
                }),
            }),
        ],
    },
)
