export const EnvironmentVariables: { [key: string]: string | number } = {
    DB_HOST: '159.65.0.142',
    DB_PORT: '27017',
    DB_NAME: 'kltn2020-v2',
    DB_USERNAME: 'alice',
    DB_PASS: 'alice',
    DB_AUTH_SOURCE: 'kltn2020-v2',

    SERVER_PORT: '3000',
    SERVER_PROTOCOL: 'https',
    SERVER_URI: 'pk2020.tk',

    // Background Job Config
    // Thread amount
    THREAD_AMOUNT: 2,
    // Schedule
    SCHEDULE_TIME_DELAY_HOUR: 48,
    SCHEDULE_TIME_DELAY_MINUTE: 0,
    SCHEDULE_TIME_DELAY_SECOND: 0,
    SCHEDULE_TIME_HOUR: 18,
    SCHEDULE_TIME_MINUTE: 0,
    SCHEDULE_TIME_SECOND: 0,
    // Scrape
    SCRAPE_RAW_DATA_MAX_REQUEST: 30,
    SCRAPE_DETAIL_URL_MAX_REQUEST: 10,
    SCRAPE_REQUEST_DELAY: 100, // ms
    // Queue base
    QUEUE_DELAY_DEFAULT: 100, // ms
    // Save queue
    SAVE_QUEUE_AMOUNT_DEFAULT: 500,

    // Request
    REQUEST_TIMEOUT: 10000, // ms

    // Chat Bot
    CHAT_BOT_TELEGRAM_TOKEN: '1046175359:AAGfHKqnAv0_IFdTEvtLmuanahYW0JWpHKE',
    NTBA_FIX_319: 1,

    // Public folder
    PUBLIC_FOLDER_PATH: '../public',

    // Google map API key
    HERE_API_KEY: 'R4VlRgnt4NgQnFjoEf108Ay39q-RbANgJAOiXyKwBFM',
};
