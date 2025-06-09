import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits : {fileSize : 5 * 1024 * 1024},
    fileFilter : (req, file , cb) => {
        if(file.mimetype.startsWith("/image")){
            cb(null, true);
        }
        else{
            cb(null, false);
            // handle file error
        }
    }
})

export default upload;

/* 
    # Why memoryStorage instead of diskStorage ?
        > For uploading to cloud storage, it's best to use Multer's memoryStorage. 
        > This stores the file in memory(RAM and hence faster) as a Buffer(raw data), which can then be directly uploaded without writing to disk first.
        > The buffer data gets deleted automatically after the request ends.
*/