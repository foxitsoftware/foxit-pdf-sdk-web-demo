const dotenv = require("dotenv")
const {PrismaClient} = require('@foxitsoftware/collab-db')
const rimraf = require('rimraf')
dotenv.config()

const dbConfig = {
    type: 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: process.env['DB_PORT'] ? +process.env['DB_PORT'] : 5432,
    database: process.env['DB_DATABASE'] || 'collab-db',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '123456',
};

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?schema=public`,
        },
    },
});

console.log("starting to clean demo data...")

console.log("starting to clean file uploads...")
rimraf.sync("./file-uploads/*")
console.log("clean file uploads succeeded")

console.log("starting to clean database data...")
Promise.all(
    [
        prisma.user.deleteMany({}),
        prisma.document.deleteMany({}),
        prisma.annotation.deleteMany({}),
        prisma.documentMember.deleteMany({}),
        prisma.invitation.deleteMany({})
    ]
).then(function (res) {
    console.log("clean database succeeded", res)
    process.exit(0)
}).catch(function (err) {
    console.log("clean database failed", err)
    process.exit(1)
})
