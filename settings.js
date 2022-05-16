//. settings.js

//. settings for amazon associate
exports.aws_tag = ( 'AWS_TAG' in process.env ) ? process.env['AWS_TAG'] : '';

//. settings for CORS
exports.cors = ( 'CORS' in process.env ) ? process.env['CORS'].split( ',' ) : [];
