import { connect, Mongoose, set } from 'mongoose';
import ConsoleLog from '@util/console/console.log';
import ConsoleConstant from '@util/console/console.constant';
import DatabaseWording from '@root/database/database.wording';

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
        this.dbHost = process.env.DB_HOST ?? '';
        this.dbPort = process.env.DB_PORT ?? '';
        this.dbName = process.env.DB_NAME ?? '';
        this.username = process.env.DB_USERNAME ?? '';
        this.password = process.env.DB_PASS ?? '';
        this.authDb = process.env.DB_AUTH_DB ?? '';

        if (process.env.NODE_ENV !== 'production') {
            set('debug', (Number(process.env.DB_DEBUG_MODE) ?? 0) === 1);
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
        try {
            const connString = `mongodb://${this.dbHost}:${this.dbPort}/${this.dbName}`;
            const options: { [key: string]: any } = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
            };

            if (process.env.NODE_ENV === 'production') {
                options.auth = { user: this.username, password: this.password };
                options.authSource = this.authDb;
            }

            this.connection = await connect(connString, options);
            new ConsoleLog(
                ConsoleConstant.Type.INFO,
                `Successful connection to (DB: ${this.dbName}).`
            ).show();
        } catch (error) {
            new ConsoleLog(
                ConsoleConstant.Type.ERROR,
                DatabaseWording.CAUSE.DBC_1[0]
            ).show();
        }
    }
}
