import mongoose from 'mongoose';
import ConsoleLog from '../../../util/console/console.log';
import { ConsoleConstant } from '../../../util/console/console.constant';

export default class DatabaseMongodb {
    private static instance: DatabaseMongodb | undefined;
    private readonly dbHost: string | undefined;
    private readonly dbPort: string | undefined;
    private readonly dbName: string | undefined;
    private readonly username: string | undefined;
    private readonly password: string | undefined;

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.dbHost = process.env.DB_HOST;
            this.dbPort = process.env.DB_PORT;
            this.dbName = process.env.DB_NAME;
            this.username = process.env.DB_USERNAME;
            this.password = process.env.DB_PASS;
        } else {
            this.dbHost = process.env.DB_HOST_DEV;
            this.dbPort = process.env.DB_PORT_DEV;
            this.dbName = process.env.DB_NAME_DEV;
            this.username = process.env.DB_USERNAME_DEV;
            this.password = process.env.DB_PASS_DEV;
        }
        mongoose.Promise = Promise;
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
            const connString: string = `mongodb://${this.dbHost as string}:${this.dbPort as string}`;
            await mongoose.connect(connString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
                auth: {
                    user: this.username as string,
                    password: this.password as string,
                },
                authSource: this.dbName,
                dbName: this.dbName,
            });
            new ConsoleLog(ConsoleConstant.Type.INFO, `Successful connection to (DB: ${this.dbName}).`).show();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Disconnect to database
     */
    public async disconnect() {
        try {
            await mongoose.disconnect();
        } catch (e) {
            throw e;
        }
    }
}
