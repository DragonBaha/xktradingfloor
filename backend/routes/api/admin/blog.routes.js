const express = require('express');
const router = express.Router();
const blogController = require('../../../controllers/blog.controller');
const pdfUpload = require("../../../middleware/file-upload.middleware");

router.post('/addblog',
    pdfUpload.fileUpload(
        "blogs",
        ["pdf", "image"],
        [{
            name: "featuredImage",
            maxCount: 1
        },
        {
            name: "images",
            maxCount: 4,
        },
        ]
    ),
    blogController.createBlog);
router.get('/getallblogs', blogController.getAllBlogs);
router.get('/blogs/:id', blogController.getBlogById);
router.put('/blogs/:id', blogController.updateBlog);
router.delete('/blogs/:id', blogController.deleteBlog);
router.delete('/blogs/:id/permanent', blogController.permanentDeleteBlog);

module.exports = router;