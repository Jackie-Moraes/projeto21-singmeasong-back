import { faker } from "@faker-js/faker"

import { prisma } from "../../src/database.js"
import { recommendationService } from "../../src/services/recommendationsService.js"
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js"
import { servicesFactory } from "../factories/servicesFactory.js"

// describe("POST /something", () => {
//     it("should answer something when something happens", async () => {})
// })

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`
})

describe("insert", () => {
    it("should create new recommendation when information isn't conflicting", async () => {
        const recommendation = servicesFactory.recommendationTemplate()
        jest.spyOn(
            recommendationRepository,
            "findByName"
        ).mockImplementationOnce((): any => {
            return false
        })

        jest.spyOn(recommendationRepository, "create").mockImplementationOnce(
            (): any => {
                return {}
            }
        )

        const result = await recommendationService.insert(recommendation)
        expect(result).toBeUndefined()
    })

    it("should throw error when recommendation conflicts with existing information", async () => {
        const recommendation = servicesFactory.recommendationTemplate()
        jest.spyOn(
            recommendationRepository,
            "findByName"
        ).mockImplementationOnce((): any => {
            return true
        })

        await recommendationService.insert(recommendation).catch((err) => {
            expect(err.message).toEqual("Recommendations names must be unique")
        })
    })
})

describe("upvote", () => {
    it("should increase recommendation score when given valid id", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return true
            }
        )

        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockImplementationOnce((): any => {
            return {}
        })

        const result = await recommendationService.upvote(1)
        expect(result).toBeUndefined()
    })

    it("should throw error when given id is invalid", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return false
            }
        )
        await recommendationService.upvote(1).catch((err) => {
            expect(err.type).toEqual("not_found")
        })
    })
})

describe("downvote", () => {
    it("should decrease recommendation score when given valid id", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return true
            }
        )

        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockImplementationOnce((): any => {
            return {}
        })

        const result = await recommendationService.downvote(1)
        expect(result).toBeUndefined()
    })

    it("should delete recommendation if score falls below 5", async () => {
        const recommendation = servicesFactory.recommendationTemplate()

        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return true
            }
        )

        jest.spyOn(
            recommendationRepository,
            "updateScore"
        ).mockImplementationOnce((): any => {
            return {
                id: 1,
                name: recommendation.name,
                youtubeLink: recommendation.youtubeLink,
                score: -6,
            }
        })

        jest.spyOn(recommendationRepository, "remove").mockImplementationOnce(
            (): any => {
                return {}
            }
        )

        const result = await recommendationService.downvote(1)
        expect(result).toBeUndefined()
    })

    it("should throw error when given id is invalid", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
            (): any => {
                return false
            }
        )
        await recommendationService.upvote(1).catch((err) => {
            expect(err.type).toEqual("not_found")
        })
    })
})

describe("get", () => {
    it("should answer with all existing recommendations", async () => {
        const recommendation = servicesFactory.recommendationTemplate()

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(
            (): any => {
                return {
                    id: 1,
                    name: recommendation.name,
                    youtubeLink: recommendation.youtubeLink,
                    score: -6,
                }
            }
        )
        const result = await recommendationService.get()
        expect(result).toStrictEqual({
            id: 1,
            name: recommendation.name,
            youtubeLink: recommendation.youtubeLink,
            score: -6,
        })
    })

    it("should answer with an empty object if there are no recommendations", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(
            (): any => {
                return {}
            }
        )

        const result = await recommendationService.get()
        expect(result).toStrictEqual({})
    })
})

describe("getTop", () => {
    it("should answer with top 3 recommendations", async () => {
        const recommendations = []
        for (let i = 0; i < 3; i++) {
            recommendations.push({
                id: i + 1,
                name: faker.name.findName(),
                youtubeLink: faker.internet.url(),
                score: (i + 1) * 3,
            })
        }

        jest.spyOn(
            recommendationRepository,
            "getAmountByScore"
        ).mockImplementationOnce((): any => {
            return [recommendations[2], recommendations[1], recommendations[0]]
        })

        const result = await recommendationService.getTop(3)
        expect(result).toStrictEqual([
            recommendations[2],
            recommendations[1],
            recommendations[0],
        ])
    })

    it("should answer with an empty array when there are no recommendations", async () => {
        jest.spyOn(
            recommendationRepository,
            "getAmountByScore"
        ).mockImplementationOnce((): any => {
            return []
        })

        const result = await recommendationService.getTop(5)
        expect(result).toStrictEqual([])
    })
})
