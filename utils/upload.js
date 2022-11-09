exports.uploading = async (req, res, next) => {
    try {
        if (req.files.file) {
            const file = req.files.file
        }
        next()
    } catch (e) {
        return res.status(500).json({
            message: e.message
        })
    }
}
