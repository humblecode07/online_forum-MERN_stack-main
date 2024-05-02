const asyncHandler = require('express-async-handler');
const { gridFSBucket } = global;

exports.get_image = asyncHandler(async (req, res, next) => {
    const filename = req.params.filename;

    const downloadStream = global.gridFSBucket.openDownloadStreamByName(filename);

    let contentType;
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
        contentType = 'image/png';
    } else if (filename.endsWith('.gif')) {
        contentType = 'image/gif';
    } else {
        contentType = 'application/octet-stream';
    }
    res.set('Content-Type', contentType);
    downloadStream.pipe(res);
})