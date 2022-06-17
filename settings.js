//. settings.js

//. settings for amazon associate
exports.pa_tag = ( 'PA_TAG' in process.env ) ? process.env['PA_TAG'] : '';

//. settings for CORS
exports.cors = ( 'CORS' in process.env ) ? process.env['CORS'].split( ',' ) : [];

//. settings for JANCODE
exports.jancodelink = ( 'JANCODELINK' in process.env ) ? process.env['JANCODELINK'] : '';
