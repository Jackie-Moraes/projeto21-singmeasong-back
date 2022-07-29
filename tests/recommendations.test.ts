import supertest from "supertest"

import { prisma } from "../src/database.js"
import app from "../src/app.js"
import { recommendationsFactory } from "./factories/recommendationsFactory.js"

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
})

// describe("POST /something", () => {
//     it("should answer something when something happens", async () => {})
// })

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
    it("should answer 200 when sent", async () => {
        const response = await supertest(app).get(`/recommendations`).send()
        expect(response.status).toBe(200)
    })
})
