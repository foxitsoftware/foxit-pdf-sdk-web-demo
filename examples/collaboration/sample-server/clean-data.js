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

// console.log("starting to clean file uploads...")
// rimraf.sync("./file-uploads/*")
// console.log("clean file uploads succeeded")

async function cleanDB(){
    console.log("starting to clean database data...")
    const cleanTime = new Date().getTime() - 24 * 3600 * 1000
    const condition = {
        where: {
            updatedAt: {
                lt: cleanTime
            }
        }
    }
    const r1 = await prisma.annotation.deleteMany(condition)
    const r2 = await prisma.documentMember.deleteMany(condition)
    const r3 = await prisma.document.deleteMany(condition)
    const r4 = await prisma.invitation.deleteMany(condition)
    const r5 = await prisma.user.deleteMany(condition)
    return [r1, r2, r3, r4, r5]
}

cleanDB().then(function (res) {
    console.log("clean database succeeded", res)
    process.exit(0)
}).catch(function (err) {
    console.log("clean database failed", err)
    process.exit(1)
})
