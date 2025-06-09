import {z} from "zod";

const SignupSchema = z.object({
    uid : z.string(),
    email : z.string().email(),
    username : z.string()
})

export default SignupSchema;