import {getAccountGear, getCharacterStore, getCharacters } from '~/services/darktide.server'
import { getAuthToken } from "~/data/authtoken.server"
import { describe, expect, test, beforeAll } from 'vitest'
import { AuthToken } from '@prisma/client'
let auth:AuthToken
beforeAll(async()=> {
        let response = await getAuthToken(1) 
        if(response){
            auth = response
        }
})

describe( 'getAccountGear', ()=> {
    test('should return something with slots', async() => {
        if(auth) {
            let accountGear = await getAccountGear(auth)
            if(accountGear) {
                let gear = accountGear.first
                if(gear){
                    expect(gear).toHaveProperty('slots')
                }
            }
        }
    })
})

describe( 'Get Shop Listing', ()=> {
    test('retrieve shop for class', async() =>{
        if(auth){
            let characters = await getCharacters(auth)
            let archetype = characters?.characters[1].archetype
            let id = characters?.characters[1].id
            if(archetype && id ) {
                          let shop = await getCharacterStore(auth, archetype, id)
            if(shop){
                expect(shop).toHaveProperty('personal')
            }
  
          }
        }
    })
})

describe('Characters', () => {
    test('get characters', async() => {
        if(auth){
            let characters = await getCharacters(auth)
            if(characters){
                expect(characters).toBeDefined
            }
        }

    })
})