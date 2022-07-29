import { faker } from "@faker-js/faker"

import { prisma } from "../../src/database.js"

const musicTemplate = () => {
    const body = {
        name: "Falamansa - Xote dos Milagres",
        youtubeLink:
            "https://www.youtube.com/watch?v=chwyjJbcs1Y&ab_channel=Deck",
    }
    return body
}

const randomRecommendationTemplate = () => {
    const body = {
        id: expect.any(Number),
        name: expect.any(String),
        youtubeLink: expect.any(String),
        score: expect.any(Number),
    }

    return body
}

async function createFixedRecommendation() {
    const info = musicTemplate()
    const recommendation = await prisma.recommendation.create({
        data: {
            name: info.name,
            youtubeLink: info.youtubeLink,
        },
    })
    return recommendation.id
}

async function setScoreForDeletion(id: number) {
    return await prisma.recommendation.update({
        where: { id },
        data: {
            score: -5,
        },
    })
}

async function checkIfRecommendationExists(id: number) {
    const exists = await prisma.recommendation.findUnique({
        where: { id },
    })
    return exists
}

async function createRandomRecommendation() {
    const info = {
        name: faker.name.findName(),
        youtubeLink: faker.internet.url(),
    }

    const recommendation = await prisma.recommendation.create({
        data: {
            name: info.name,
            youtubeLink: info.youtubeLink,
        },
    })
    return recommendation
}

async function raiseRecommendationScore(id: number, value: number) {
    await prisma.recommendation.update({
        data: {
            score: value,
        },
        where: { id: id },
    })
}

export const recommendationsFactory = {
    musicTemplate,
    createFixedRecommendation,
    setScoreForDeletion,
    checkIfRecommendationExists,
    createRandomRecommendation,
    randomRecommendationTemplate,
}
