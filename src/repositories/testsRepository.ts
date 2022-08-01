import { prisma } from "../database.js"

async function resetDatabase() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
}

async function seed() {
    await prisma.recommendation.create({
        data: {
            name: "Bananza (Belly Dancer)",
            youtubeLink: "https://www.youtube.com/watch?v=DdK8CALZeFE",
            score: -4,
        },
    })
}

export const testsRepository = {
    resetDatabase,
    seed,
}
