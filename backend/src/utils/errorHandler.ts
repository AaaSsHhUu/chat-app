class ErrorHandler extends Error {
    constructor(public message : string,public statusCode : number){
        super(message);
        this.statusCode = statusCode;
    }
}

export default ErrorHandler;

/*
    # When you use public (or private, protected, readonly) in front of a constructor parameter, TypeScript automatically declares a class property with that same name and access modifier.
        - So, public message: string automatically creates a class property this.message of type string.
        - And public statusCode: number automatically creates a class property this.statusCode of type number.
*/