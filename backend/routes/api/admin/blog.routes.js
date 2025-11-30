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
router.get('/:blogid/getblogbyid', blogController.getBlogById);
router.put('/:blogid/updateblog',
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
    blogController.updateBlog);
router.delete('/:blogid/deleteblog', blogController.deleteBlog);
router.delete('/:blogid/permanentdeleteblog', blogController.permanentDeleteBlog);

module.exports = router;