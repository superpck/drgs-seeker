import express from 'express';
const router = express.Router();
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

router.use('/', require('./routes/drg-seeker'));

router.get('*', function (req, res) {
	let url = req.originalUrl || req.baseUrl || req.url;
	console.log(`status ${StatusCodes.NOT_FOUND}`, url);
	res.send({
		statusCode: StatusCodes.NOT_FOUND,
		message: getReasonPhrase(StatusCodes.NOT_FOUND)
	});
});

module.exports = router;