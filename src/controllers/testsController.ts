import { Request, Response } from "express"

import { testsRepository } from "../repositories/testsRepository.js"

async function resetDatabase(req: Request, res: Response) {
    await testsRepository.resetDatabase()
    res.sendStatus(200)
}

async function seed(req: Request, res: Response) {
    await testsRepository.seed()
    res.sendStatus(200)
}

export const testsController = { resetDatabase, seed }
