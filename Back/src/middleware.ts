import { MiddlewareRoute } from "utils";

export const config: MiddlewareRoute[] = [
{
    matcher: '/test',
    middlewares:[(req,res,next)=>{
        res.json({message:"middleware active"})
    }],
    method:['GET']
}
]