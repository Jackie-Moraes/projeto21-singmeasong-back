import { prisma } from "../../src/database.js"

const musicTemplate = () => {
    const body = {
        name: "Falamansa - Xote dos Milagres",
        youtubeLink:
            "https://www.youtube.com/watch?v=chwyjJbcs1Y&ab_channel=Deck",
    }
    return body
}

async function createRecommendation() {
    const info = musicTemplate()
    const recommendation = await prisma.recommendation.create({
        data: {
            name: info.name,
            youtubeLink: info.youtubeLink,
        },
    })
    return recommendation.id
}

export const recommendationsFactory = { musicTemplate, createRecommendation }
