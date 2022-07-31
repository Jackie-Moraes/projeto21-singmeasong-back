import supertest from "supertest"

import { prisma } from "../../src/database.js"
import app from "../../src/app.js"
import { recommendationsFactory } from "../factories/recommendationsFactory.js"

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
})

describe("POST /recommendations", () => {
    it("should answer 201 when valid information is sent", async () => {
        const body = recommendationsFactory.musicTemplate()
        const response = await supertest(app)
            .post("/recommendations")
            .send(body)
        expect(response.status).toBe(201)
    })

    it("should answer 422 when information is missing", async () => {
        const response = await supertest(app).post("/recommendations").send()
        expect(response.status).toBe(422)
    })

    it("should answer 409 when sending information with duplicated name", async () => {
        await recommendationsFactory.createFixedRecommendation()

        const body = recommendationsFactory.musicTemplate()
        const response = await supertest(app)
            .post("/recommendations")
            .send(body)
        expect(response.status).toBe(409)
    })
})

describe("POST /recommendations/:id/upvote", () => {
    it("should answer 200 when posting to existing id", async () => {
        const id = await recommendationsFactory.createFixedRecommendation()
        const response = await supertest(app)
            .post(`/recommendations/${id}/upvote`)
            .send()
        expect(response.status).toBe(200)
    })

    it("should answer 404 when posting to inexistent id", async () => {
        const response = await supertest(app)
            .post(`/recommendations/0/upvote`)
            .send()
        expect(response.status).toBe(404)
    })
})

describe("POST /recommendations/:id/downvote", () => {
    it("should answer 200 when posting to existing id", async () => {
        const id = await recommendationsFactory.createFixedRecommendation()
        const response = await supertest(app)
            .post(`/recommendations/${id}/downvote`)
            .send()
        expect(response.status).toBe(200)
    })

    it("should answer 404 when posting to inexistent id", async () => {
        const response = await supertest(app)
            .post(`/recommendations/0/downvote`)
            .send()
        expect(response.status).toBe(404)
    })

    it("should delete recommendation when score is under five and return null", async () => {
        const id = await recommendationsFactory.createFixedRecommendation()
        await recommendationsFactory.setScoreForDeletion(id)
        await supertest(app).post(`/recommendations/${id}/downvote`).send()
        const exists = await recommendationsFactory.checkIfRecommendationExists(
            id
        )
        expect(exists).toBe(null)
    })
})

describe("GET /recommendations", () => {
    it("should answer with correct recommendation information", async () => {
        const recommendations = []
        for (let i = 1; i <= 3; i++) {
            recommendations.push(
                await recommendationsFactory.createRandomRecommendation()
            )
        }

        const response = await supertest(app).get(`/recommendations`).send()
        expect(response.body).toStrictEqual([
            recommendations[2],
            recommendations[1],
            recommendations[0],
        ])
    })

    it("should return empty if database has no recommendations", async () => {
        const response = await supertest(app).get(`/recommendations`).send()
        expect(response.body).toStrictEqual([])
    })
})

describe("GET /recommendations/:id", () => {
    it("should answer with recommendation information when given existing id", async () => {
        const recommendation =
            await recommendationsFactory.createRandomRecommendation()
        const response = await supertest(app)
            .get(`/recommendations/${recommendation.id}`)
            .send()
        expect(response.body).toStrictEqual(recommendation)
    })

    it("should return 404 if id is incorrect", async () => {
        const response = await supertest(app).get(`/recommendations/0`).send()
        expect(response.status).toBe(404)
    })
})

describe("GET /recommendations/random", () => {
    it("should answer with random existing recommendation", async () => {
        for (let i = 1; i <= 2; i++) {
            await recommendationsFactory.createRandomRecommendation()
        }

        const recommendation =
            recommendationsFactory.randomRecommendationTemplate()

        const response = await supertest(app)
            .get(`/recommendations/random`)
            .send()
        expect(response.body).toStrictEqual(recommendation)
    })

    it("should answer with 404 when no recommendations exist", async () => {
        const response = await supertest(app)
            .get(`/recommendations/random`)
            .send()
        expect(response.status).toBe(404)
    })
})

describe("GET /recommendations/top/:amount", () => {
    it("should answer with the top three recommendations in order", async () => {
        let number = 5
        const recommendations = []
        for (let i = 0; i <= 4; i++) {
            recommendations.push(
                await recommendationsFactory.createRandomRecommendation()
            )
            await recommendationsFactory.raiseRecommendationScore(
                recommendations[i].id,
                number
            )
            recommendations[i].score = number
            number--
        }

        const response = await supertest(app)
            .get(`/recommendations/top/3`)
            .send()
        expect(response.body).toStrictEqual([
            recommendations[0],
            recommendations[1],
            recommendations[2],
        ])
    })

    it("should answer with an empty array when there are no recommendations", async () => {
        const response = await supertest(app)
            .get(`/recommendations/top/3`)
            .send()
        expect(response.body).toStrictEqual([])
    })
})
