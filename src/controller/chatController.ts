import {GoogleGenerativeAI} from '@google/generative-ai'
import {Request,Response} from 'express'
import {config} from 'dotenv'
config()

const handler =  async (req:Request,res:Response) =>{
    const {prompt} = req.body
    const apiKey =  process.env.GEMINI_API_KEY || ''
    if(!apiKey){
        console.error('Erro: GEMINI_API_KEY não encontrada nas variaveis de ambiente')
    }
    try{        
        const genAI =  new GoogleGenerativeAI(apiKey)
        const model =  genAI.getGenerativeModel({model: 'gemini-2.5-pro'})
        const result = await  model.generateContent(prompt)
        const response = await result.response
        const text = response.text()        
        return res.status(200).json({text: text})
    }catch(error){
        console.error(`Erro ao chamar a API do Gemini ${error}`)
            res.status(500).json({message:'Erro de servidor'})
        }
}

export default {
    handler
}
