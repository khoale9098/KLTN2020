import { connect, Mongoose, set } from 'mongoose';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';

export default class DatabaseMongodb {
    private static instance: DatabaseMongodb | undefined;

    public connection: Mongoose | undefined;

    private readonly dbHost: string | undefined;

    private readonly dbPort: string | undefined;

    private readonly dbName: string | undefined;

    private readonly authDb: string | undefined;

    private readonly username: string | undefined;

    private readonly password: string | undefined;

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.dbHost = process.env.PROD_DB_HOST ?? '';
            this.dbPort = process.env.PROD_DB_PORT ?? '';
            this.dbName = process.env.PROD_DB_NAME ?? '';
            this.username = process.env.PROD_DB_USERNAME ?? '';
            this.password = process.env.PROD_DB_PASS ?? '';
            this.authDb = process.env.PROD_DB_AUTH_DB ?? '';
        } else {
            this.dbHost = process.env.DEV_DB_HOST ?? '';
            this.dbPort = process.env.DEV_DB_PORT ?? '';
            this.dbName = process.env.DEV_DB_NAME ?? '';
            this.username = process.env.DEV_DB_USERNAME ?? '';
            this.password = process.env.DEV_DB_PASS ?? '';
            this.authDb = process.env.DEV_DB_AUTH_DB ?? '';
            set('debug', (Number(process.env.DEV_DB_DEBUG_MODE) ?? 0) === 1);
        }
    }

    /**
     * Get instance
     */
    public static getInstance(): DatabaseMongodb {
        if (!this.instance) {
            this.instance = new DatabaseMongodb();
        }

        return this.instance;
    }

    /**
     * Open connection to database
     */
    public async connect(): Promise<void> {
        const connString = `mongodb://${this.dbHost as string}:${this.dbPort as string}`;
        this.connection = await connect(connString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
            // auth: {
            //     user: this.username as string,
            //     password: this.password as string,
            // },
            authSource: this.authDb,
            dbName: this.dbName,
        });
        new ConsoleLog(ConsoleConstant.Type.INFO, `Successful connection to (DB: ${this.dbName}).`).show();
    }
}
