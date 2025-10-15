module.exports = {
    dbUrl: process.env.DBURL,
    hashConfig: {
        SIGNERKEY: "jxspr8Ki0RYycVU8zykbdLGjFQ3McFsasaUH0uiiTvC8pVMXAn210wjLNmdZJzxUECKbm0QsEmYUSDzZvpjeJ9WmXA==",
        SALTSEPARATOR: "Bw==",
        ALGORITHM: "aes-256-cbc",
        IV_LENGTH: 16,
        IV_VALUE: "mfN5PaAnRvNRfLUJ0yfzJg==",
        KEYLEN: 32,
        PARAMS: {
            "N": 16384,
            "r": 8,
            "p": 1,
            "maxmem": 33554432
        }
    },
    jwt: {
        user: { secret: "b6QBvxXz4LRQ3dqe2ePXXDQuYlICO1dswewee" },
        issuer: "test",
        accessTokenExpiresIn: "10 days",
        refreshTokenExpiresIn: "30 days",
    },
    mailConfig: {
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
    },
}
