import { Request, Response } from "express";
import { Router } from "express";
import { User } from "../entities/UserEntity";

const AuthenticationRouter = Router();

AuthenticationRouter.get("/login", (request: Request, response: Response) => { 
  response.status(200).send("El servidor ha funcionado");
}); 
AuthenticationRouter.post("/register",(request:Request, response:Response) =>{
    const user:User = request.body;

    if(!user){
      response.status(400).send("El usuario no existe");
    }

    response.send({
      message: `Se ha registrado correctamente el usuario ${user.name} con id ${user.id}`,
      user: user
    });
});

export default AuthenticationRouter;

