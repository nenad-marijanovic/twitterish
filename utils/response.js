'use strict';

class Response{
    static success (data, pagination= undefined, sort= undefined){
        let obj={data: {} };

        if(data && typeof data === 'object'){
            Object.assign(obj.data, data);
        }
        else{
            obj.data.value=data;
        }

        return obj;
    }
    static error (code, message, errors=null){
        let obj={
            error: {
                code: code,
                message: message
            }
        };
        if (errors != null){
            obj.error = errors;
        }
    }
}

module.exports= Response;