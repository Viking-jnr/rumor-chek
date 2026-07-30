function requireAccessCode(req, res, next) {
    const provided = req.headers['x-access-code'];
    if (!provided || provided !== process.env.OFFICIAL_ACCESS_CODE) {
        return res.status(401).json({error: "Invalid or Missing Access Code!"});
    }
    next();
}

module.exports = requireAccessCode;