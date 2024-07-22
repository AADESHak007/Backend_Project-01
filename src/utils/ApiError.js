// this will handle the errros based on our customization 
//we are jsut extending the Error class of tlhe nodeJS and creating our own constructors

class ApiError extends Error {
    constructor(
        statusCode,
        message ="Invalid",
        errors =[],
        stack ,
    ){
        //overriding the deafult values of the ERROR class

        super(message) ;
        this.statusCode = statusCode ;
        this.errors = errors ;
        this.data = null ;
        this.message = message ;
        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
        

    }
}

export {ApiError} ;