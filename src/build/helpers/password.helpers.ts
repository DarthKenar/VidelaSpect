//Bcrypt Config
const bcrypt = require('bcrypt');
const saltRounds = 10;

export async function encryptPass(password:string):Promise<string>{
    // https://www.npmjs.com/package/bcrypt
    return await bcrypt.hashSync(password, saltRounds);
}

export async function comparePass(password1:string,passwordInDb:string):Promise<boolean>{
    return (bcrypt.compareSync(password1,passwordInDb))
}
